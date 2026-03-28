import { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ───────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const RISK_CONFIG = {
  Conservative: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "🛡️" },
  Moderate:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "⚖️" },
  Aggressive:   { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: "🔥" },
};

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes("Google") || v.lang === "en-US");
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

// ─── Sub-components ────────────────────────────────────────────────────────

function UploadZone({ onUpload, isLoading }) {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles[0]) onUpload(acceptedFiles[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={styles.uploadPage}
    >
      {/* Header */}
      <div style={styles.uploadHeader}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>⚡</div>
          <span style={styles.logoText}>FinPilot <span style={styles.logoAI}>AI</span></span>
        </div>
        <p style={styles.tagline}>Your portfolio-aware AI financial advisor</p>
      </div>

      {/* Drop Zone */}
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        style={{
          ...styles.dropzone,
          borderColor: isDragActive ? "#6366f1" : "rgba(99,102,241,0.3)",
          background: isDragActive ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.6)",
        }}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Analyzing your portfolio…</p>
            <p style={styles.loadingSubtext}>AI is reading your holdings</p>
          </div>
        ) : (
          <div style={styles.dropContent}>
            <motion.div
              animate={{ y: isDragActive ? -8 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={styles.dropIcon}
            >
              📄
            </motion.div>
            <p style={styles.dropTitle}>
              {isDragActive ? "Drop it here!" : "Drop your portfolio PDF"}
            </p>
            <p style={styles.dropSub}>or click to browse • PDF only • max 10MB</p>
          </div>
        )}
      </motion.div>

      {/* Feature Pills */}
      <div style={styles.featurePills}>
        {["📊 Stock Analysis", "⚖️ Risk Assessment", "💬 AI Chat", "🎤 Voice Q&A"].map(f => (
          <div key={f} style={styles.pill}>{f}</div>
        ))}
      </div>
    </motion.div>
  );
}

function PortfolioPanel({ portfolio }) {
  const risk = RISK_CONFIG[portfolio.riskLevel] || RISK_CONFIG.Moderate;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={styles.portfolioPanel}
    >
      <div style={styles.panelHeader}>
        <span style={styles.panelTitle}>📁 Your Portfolio</span>
      </div>

      {/* Risk Badge */}
      <div style={{ ...styles.riskBadge, background: risk.bg, borderColor: risk.color }}>
        <span style={{ fontSize: 20 }}>{risk.icon}</span>
        <div>
          <div style={{ ...styles.riskLabel, color: risk.color }}>{portfolio.riskLevel} Risk</div>
          <div style={styles.riskScore}>Score: {portfolio.riskScore}/10</div>
        </div>
      </div>

      {/* Summary */}
      <p style={styles.summary}>{portfolio.summary}</p>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{portfolio.holdings?.length ?? "—"}</div>
          <div style={styles.statLabel}>Holdings</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{portfolio.diversificationScore}/10</div>
          <div style={styles.statLabel}>Diversified</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{portfolio.currency ?? "USD"}</div>
          <div style={styles.statLabel}>Currency</div>
        </div>
      </div>

      {/* Holdings List */}
      <div style={styles.holdingsHeader}>Top Holdings</div>
      <div style={styles.holdingsList}>
        {(portfolio.holdings ?? []).slice(0, 8).map((h, i) => (
          <motion.div
            key={h.symbol}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={styles.holdingRow}
          >
            <div style={styles.holdingLeft}>
              <div style={styles.holdingSymbol}>{h.symbol}</div>
              <div style={styles.holdingName}>{h.name}</div>
            </div>
            <div style={styles.holdingRight}>
              <div style={styles.holdingAlloc}>{h.allocation}%</div>
              <div style={styles.holdingBar}>
                <div style={{ ...styles.holdingBarFill, width: `${Math.min(h.allocation, 100)}%` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sectors */}
      {portfolio.topSectors?.length > 0 && (
        <div style={styles.sectorSection}>
          <div style={styles.holdingsHeader}>Sectors</div>
          <div style={styles.sectorPills}>
            {portfolio.topSectors.map(s => (
              <span key={s} style={styles.sectorPill}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Voice Overlay ─────────────────────────────────────────────────────────
function VoiceOverlay({ isListening, isSpeaking, transcript, onStop, onClose }) {
  const bars = Array.from({ length: 28 });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.voiceOverlay}
    >
      {/* Dark blurred bg */}
      <div style={styles.voiceBg} />

      <div style={styles.voiceCard}>
        {/* Orb */}
        <div style={styles.orbWrap}>
          <motion.div
            animate={isListening ? { scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] } : isSpeaking ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={styles.orbGlow}
          />
          <div style={styles.orb}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="#fff" opacity="0.95"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Label */}
        <div style={styles.voiceLabel}>
          {isListening ? "Listening…" : isSpeaking ? "FinPilot is speaking…" : "Voice Assistant"}
        </div>

        {/* Waveform bars */}
        <div style={styles.waveRow}>
          {bars.map((_, i) => {
            const active = isListening || isSpeaking;
            const center = Math.abs(i - 13.5) / 13.5;
            const baseH = active ? 6 + (1 - center) * 28 : 4;
            return (
              <motion.div
                key={i}
                animate={active ? {
                  height: [
                    baseH,
                    baseH + Math.random() * 24 * (1 - center * 0.5),
                    baseH,
                  ],
                } : { height: 4 }}
                transition={active ? {
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: i * 0.03,
                  ease: "easeInOut",
                } : {}}
                style={{
                  ...styles.waveBar,
                  background: isListening
                    ? `hsl(${260 + i * 4}, 80%, 65%)`
                    : isSpeaking
                    ? `hsl(${180 + i * 6}, 80%, 55%)`
                    : "rgba(255,255,255,0.2)",
                }}
              />
            );
          })}
        </div>

        {/* Transcript preview */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.transcriptBox}
          >
            "{transcript}"
          </motion.div>
        )}

        {/* Stop / Close buttons */}
        <div style={styles.voiceBtnRow}>
          {isListening && (
            <button onClick={onStop} style={styles.voiceStopBtn}>
              <span style={{ fontSize: 20 }}>⏹</span>
              <span>Stop & Send</span>
            </button>
          )}
          {isSpeaking && (
            <button onClick={onStop} style={styles.voiceStopBtn}>
              <span style={{ fontSize: 20 }}>⏹</span>
              <span>Stop Speaking</span>
            </button>
          )}
          <button onClick={onClose} style={styles.voiceCloseBtn}>✕ Close</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Chat Panel ─────────────────────────────────────────────────────────────
function ChatPanel({ sessionId, portfolio }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hello! I'm FinPilot, your AI advisor. I've analyzed your ${portfolio.riskLevel?.toLowerCase()} portfolio with ${portfolio.holdings?.length} holdings. What would you like to know?`,
      id: 0,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [transcript, setTranscript] = useState("");
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return;
    setTranscript("");
    const userMsg = { role: "user", text: text.trim(), id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/finpilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        const aiMsg = { role: "assistant", text: data.response, id: Date.now() + 1 };
        setMessages(prev => [...prev, aiMsg]);
        // Auto-speak if voice overlay is open
        if (showVoiceOverlay) {
          setIsSpeaking(true);
          speak(data.response);
          setTimeout(() => setIsSpeaking(false), data.response.length * 55);
        }
      } else {
        throw new Error(data.error);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "I encountered an issue. Please try again.",
        id: Date.now() + 1,
        error: true,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported. Please use Chrome.");
      return;
    }
    setShowVoiceOverlay(true);
    setTranscript("");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        sendMessage(t);
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopVoiceOrSpeaking = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  };

  const closeVoiceOverlay = () => {
    stopVoiceOrSpeaking();
    setShowVoiceOverlay(false);
    setTranscript("");
  };

  const QUICK = ["What's my biggest risk?", "Should I rebalance?", "Top performing sector?", "Any red flags?"];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{ ...styles.chatPanel, position: "relative" }}
    >
      {/* Voice Overlay */}
      <AnimatePresence>
        {showVoiceOverlay && (
          <VoiceOverlay
            isListening={isListening}
            isSpeaking={isSpeaking}
            transcript={transcript}
            onStop={stopVoiceOrSpeaking}
            onClose={closeVoiceOverlay}
          />
        )}
      </AnimatePresence>

      {/* Chat Header */}
      <div style={styles.chatHeader}>
        <div style={styles.chatHeaderLeft}>
          <div style={styles.aiAvatar}>⚡</div>
          <div>
            <div style={styles.chatName}>FinPilot AI</div>
            <div style={styles.chatStatus}>● Online</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messageArea}>
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              style={msg.role === "user" ? styles.userBubbleWrap : styles.aiBubbleWrap}
            >
              {msg.role === "assistant" && (
                <div style={styles.aiAvatarSmall}>⚡</div>
              )}
              <div style={msg.role === "user" ? styles.userBubble : (msg.error ? styles.errorBubble : styles.aiBubble)}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.aiBubbleWrap}
          >
            <div style={styles.aiAvatarSmall}>⚡</div>
            <div style={styles.typingBubble}>
              <span style={styles.dot1} />
              <span style={styles.dot2} />
              <span style={styles.dot3} />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div style={styles.quickRow}>
        {QUICK.map(q => (
          <button key={q} onClick={() => sendMessage(q)} style={styles.quickBtn}>{q}</button>
        ))}
      </div>

      {/* Input Row */}
      <div style={styles.inputRow}>
        <button
          onClick={startVoice}
          style={styles.voiceBtn}
          title="Open Voice Assistant"
        >
          🎤
        </button>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your portfolio… (Enter to send)"
          style={styles.chatInput}
          rows={1}
          disabled={isTyping}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          style={{
            ...styles.sendBtn,
            opacity: !input.trim() || isTyping ? 0.5 : 1,
          }}
        >
          ↑
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function FinPilot() {
  const [portfolio, setPortfolio] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("portfolio", file);

      const res = await fetch(`${API_BASE}/finpilot/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setPortfolio(data.portfolio);
        setSessionId(data.sessionId);
      } else {
        setError(data.error || "Upload failed.");
      }
    } catch (err) {
      setError(err.message || "Server unreachable. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setPortfolio(null);
    setSessionId(null);
    setError(null);
  };

  return (
    <div style={styles.root}>
      {/* Background */}
      <div style={styles.bgMesh} />

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.toast}
          >
            ⚠️ {error}
            <button onClick={() => setError(null)} style={styles.toastClose}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!portfolio ? (
          <UploadZone key="upload" onUpload={handleUpload} isLoading={isLoading} />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.dashboard}
          >
            {/* Top Bar */}
            <div style={styles.topBar}>
              <div style={styles.logoRow}>
                <div style={styles.logoIcon}>⚡</div>
                <span style={styles.logoText}>FinPilot <span style={styles.logoAI}>AI</span></span>
              </div>
              <button onClick={reset} style={styles.resetBtn}>↩ New Portfolio</button>
            </div>

            {/* Split Screen */}
            <div style={styles.splitScreen}>
              <PortfolioPanel portfolio={portfolio} />
              <ChatPanel sessionId={sessionId} portfolio={portfolio} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = {
  root: {
    minHeight: "100vh",
    background: "#f8f9ff",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgMesh: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.06) 0%, transparent 60%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  // Upload Page
  uploadPage: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "40px 24px",
    gap: 32,
  },
  uploadHeader: { textAlign: "center" },
  logoRow: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 12 },
  logoIcon: { fontSize: 32, background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 12, padding: "6px 10px" },
  logoText: { fontSize: 28, fontWeight: 800, color: "#1e1b4b", letterSpacing: "-0.5px" },
  logoAI: { background: "linear-gradient(90deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  tagline: { color: "#6b7280", fontSize: 16, margin: 0 },

  dropzone: {
    width: "100%",
    maxWidth: 520,
    minHeight: 240,
    border: "2px dashed",
    borderRadius: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 40px rgba(99,102,241,0.1)",
  },
  loadingState: { textAlign: "center" },
  spinner: {
    width: 44, height: 44,
    border: "3px solid rgba(99,102,241,0.2)",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 16px",
  },
  loadingText: { color: "#6366f1", fontWeight: 700, fontSize: 17, margin: "0 0 4px" },
  loadingSubtext: { color: "#9ca3af", fontSize: 14, margin: 0 },
  dropContent: { textAlign: "center", padding: 32 },
  dropIcon: { fontSize: 52, marginBottom: 16 },
  dropTitle: { fontSize: 20, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px" },
  dropSub: { color: "#9ca3af", fontSize: 14, margin: 0 },

  featurePills: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  pill: {
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 100,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    color: "#4338ca",
    boxShadow: "0 2px 8px rgba(99,102,241,0.1)",
  },

  // Toast
  toast: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#fff1f2",
    border: "1px solid #fca5a5",
    color: "#b91c1c",
    borderRadius: 12,
    padding: "12px 20px",
    fontWeight: 600,
    fontSize: 14,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 4px 20px rgba(239,68,68,0.15)",
  },
  toastClose: { background: "none", border: "none", cursor: "pointer", color: "#b91c1c", fontSize: 16 },

  // Dashboard
  dashboard: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100vh" },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 28px",
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(99,102,241,0.12)",
    boxShadow: "0 2px 16px rgba(99,102,241,0.07)",
  },
  resetBtn: {
    background: "none",
    border: "1.5px solid rgba(99,102,241,0.3)",
    borderRadius: 10,
    padding: "8px 16px",
    color: "#6366f1",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },

  splitScreen: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    gap: 0,
  },

  // Portfolio Panel
  portfolioPanel: {
    width: 340,
    minWidth: 300,
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(16px)",
    borderRight: "1px solid rgba(99,102,241,0.1)",
    padding: "24px 20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  panelTitle: { fontWeight: 800, fontSize: 16, color: "#1e1b4b" },

  riskBadge: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1.5px solid",
  },
  riskLabel: { fontWeight: 700, fontSize: 15 },
  riskScore: { fontSize: 12, color: "#9ca3af", marginTop: 2 },

  summary: { color: "#6b7280", fontSize: 13, lineHeight: 1.6, margin: 0 },

  statsRow: { display: "flex", gap: 8 },
  statCard: {
    flex: 1,
    background: "rgba(99,102,241,0.06)",
    borderRadius: 12,
    padding: "10px 8px",
    textAlign: "center",
    border: "1px solid rgba(99,102,241,0.12)",
  },
  statValue: { fontWeight: 800, fontSize: 18, color: "#4338ca" },
  statLabel: { fontSize: 11, color: "#9ca3af", marginTop: 2 },

  holdingsHeader: { fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8 },
  holdingsList: { display: "flex", flexDirection: "column", gap: 8 },
  holdingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    background: "rgba(248,249,255,0.8)",
    borderRadius: 10,
    border: "1px solid rgba(99,102,241,0.08)",
  },
  holdingLeft: {},
  holdingSymbol: { fontWeight: 700, fontSize: 13, color: "#1e1b4b" },
  holdingName: { fontSize: 11, color: "#9ca3af", marginTop: 1 },
  holdingRight: { textAlign: "right" },
  holdingAlloc: { fontWeight: 700, fontSize: 13, color: "#6366f1" },
  holdingBar: { width: 60, height: 4, background: "rgba(99,102,241,0.15)", borderRadius: 2, marginTop: 4 },
  holdingBarFill: { height: "100%", background: "linear-gradient(90deg,#6366f1,#a855f7)", borderRadius: 2 },

  sectorSection: { display: "flex", flexDirection: "column", gap: 8 },
  sectorPills: { display: "flex", flexWrap: "wrap", gap: 6 },
  sectorPill: {
    background: "rgba(99,102,241,0.1)",
    color: "#4338ca",
    borderRadius: 100,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
  },

  // Chat Panel
  chatPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "rgba(248,249,255,0.6)",
    backdropFilter: "blur(8px)",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    background: "rgba(255,255,255,0.9)",
    borderBottom: "1px solid rgba(99,102,241,0.1)",
  },
  chatHeaderLeft: { display: "flex", alignItems: "center", gap: 12 },
  aiAvatar: {
    width: 40, height: 40,
    background: "linear-gradient(135deg,#6366f1,#a855f7)",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  chatName: { fontWeight: 700, fontSize: 15, color: "#1e1b4b" },
  chatStatus: { fontSize: 12, color: "#22c55e", fontWeight: 500 },
  stopBtn: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#ef4444",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },

  messageArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  userBubbleWrap: { display: "flex", justifyContent: "flex-end" },
  aiBubbleWrap: { display: "flex", alignItems: "flex-end", gap: 10 },
  aiAvatarSmall: {
    width: 28, height: 28,
    background: "linear-gradient(135deg,#6366f1,#a855f7)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    flexShrink: 0,
  },

  userBubble: {
    maxWidth: "68%",
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff",
    borderRadius: "18px 18px 4px 18px",
    padding: "12px 16px",
    fontSize: 14,
    lineHeight: 1.6,
    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
  },
  aiBubble: {
    maxWidth: "72%",
    background: "rgba(255,255,255,0.95)",
    color: "#1e1b4b",
    borderRadius: "18px 18px 18px 4px",
    padding: "12px 16px",
    fontSize: 14,
    lineHeight: 1.6,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    border: "1px solid rgba(99,102,241,0.1)",
  },
  errorBubble: {
    maxWidth: "72%",
    background: "#fff1f2",
    color: "#b91c1c",
    borderRadius: "18px 18px 18px 4px",
    padding: "12px 16px",
    fontSize: 14,
    lineHeight: 1.6,
    border: "1px solid #fca5a5",
  },
  typingBubble: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: "18px 18px 18px 4px",
    padding: "14px 20px",
    display: "flex",
    gap: 5,
    alignItems: "center",
    border: "1px solid rgba(99,102,241,0.1)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  dot1: { width: 8, height: 8, borderRadius: "50%", background: "#6366f1", animation: "bounce 1.2s 0s infinite" },
  dot2: { width: 8, height: 8, borderRadius: "50%", background: "#6366f1", animation: "bounce 1.2s 0.2s infinite" },
  dot3: { width: 8, height: 8, borderRadius: "50%", background: "#6366f1", animation: "bounce 1.2s 0.4s infinite" },

  quickRow: {
    display: "flex",
    gap: 8,
    padding: "0 24px 12px",
    overflowX: "auto",
  },
  quickBtn: {
    background: "rgba(255,255,255,0.9)",
    border: "1.5px solid rgba(99,102,241,0.2)",
    borderRadius: 100,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "#4338ca",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "all 0.15s",
  },

  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 24px 20px",
    background: "rgba(255,255,255,0.9)",
    borderTop: "1px solid rgba(99,102,241,0.1)",
  },
  voiceBtn: {
    width: 44, height: 44,
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg,#7c3aed,#6366f1)",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    flexShrink: 0,
    boxShadow: "0 2px 12px rgba(124,58,237,0.4)",
    transition: "all 0.2s",
  },
  chatInput: {
    flex: 1,
    background: "rgba(248,249,255,0.9)",
    border: "1.5px solid rgba(99,102,241,0.2)",
    borderRadius: 14,
    padding: "12px 16px",
    fontSize: 14,
    color: "#1e1b4b",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },
  sendBtn: {
    width: 44, height: 44,
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 0.15s",
  },

  // ─── Voice Overlay ──────────────────────────────────────────────────────────
  voiceOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  },
  voiceBg: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(160deg, #0d0d1a 0%, #0f0a2e 50%, #060d1f 100%)",
    backdropFilter: "blur(16px)",
  },
  voiceCard: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 28,
    padding: "48px 40px",
    width: "100%",
    maxWidth: 420,
  },
  orbWrap: {
    position: "relative",
    width: 110,
    height: 110,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  orbGlow: {
    position: "absolute",
    inset: -16,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(99,102,241,0.3) 50%, transparent 70%)",
    filter: "blur(8px)",
  },
  orb: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #6366f1, #a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 40px rgba(139,92,246,0.6), 0 0 80px rgba(99,102,241,0.3)",
    border: "2px solid rgba(255,255,255,0.15)",
  },
  voiceLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.5,
    textAlign: "center",
    textShadow: "0 0 20px rgba(139,92,246,0.8)",
  },
  waveRow: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    height: 60,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 4,
    transition: "background 0.3s",
  },
  transcriptBox: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "10px 16px",
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    maxWidth: 340,
    lineHeight: 1.5,
  },
  voiceBtnRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  voiceStopBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(239,68,68,0.15)",
    border: "1.5px solid rgba(239,68,68,0.5)",
    borderRadius: 100,
    padding: "10px 22px",
    color: "#fca5a5",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  voiceCloseBtn: {
    background: "rgba(255,255,255,0.07)",
    border: "1.5px solid rgba(255,255,255,0.15)",
    borderRadius: 100,
    padding: "10px 22px",
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};