import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrustMeter({ score }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : pct >= 25 ? '#ea580c' : '#dc2626';
  const label =
    pct >= 75 ? 'High Trust' : pct >= 50 ? 'Moderate Trust' : pct >= 25 ? 'Low Trust' : 'Very Low Trust';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 314} 314`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-800">{pct}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-bold uppercase tracking-widest" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function SentimentBadge({ sentiment }) {
  const config = {
    Bullish: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', icon: '📈' },
    Bearish: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: '📉' },
    Neutral: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', icon: '⚖️' },
  };
  const c = config[sentiment] || config.Neutral;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {c.icon} {sentiment}
    </span>
  );
}

function BiasBadge({ bias }) {
  const config = {
    None: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    Low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    Medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    High: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };
  const c = config[bias] || config.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
      🔍 Bias: {bias}
    </span>
  );
}


function SignalStrengthBadge({ strength }) {
  const config = {
    'Strong Signal':   { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', icon: '⚡' },
    'Moderate Signal': { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-300',    icon: '〜' },
    'Weak Signal':     { bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-slate-300',   icon: '◌' },
  };
  const c = config[strength] || config['Moderate Signal'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {c.icon} {strength}
    </span>
  );
}

function SourceCard({ source, index }) {
  const sentimentColor = {
    positive: 'bg-emerald-500',
    negative: 'bg-red-500',
    neutral: 'bg-slate-400',
  };
  const dot = sentimentColor[source.sentiment] || 'bg-slate-400';
  const conf = Math.round((source.confidence || 0.5) * 100);

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-indigo-700 transition-colors">
            {source.title}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-500 font-medium">{source.source}</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-xs text-slate-500 capitalize">{source.sentiment} · {conf}%</span>
            </div>
          </div>
        </div>
        <span className="text-slate-400 group-hover:text-indigo-500 transition-colors text-sm">↗</span>
      </div>
    </a>
  );
}

function MarketDataCard({ data }) {
  if (!data) return null;
  const isUp = data.changePercent >= 0;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Market Data</p>
          <h3 className="text-lg font-black text-slate-800">{data.companyName}</h3>
          <p className="text-sm text-slate-500 font-mono">{data.ticker}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900">
            {data.currency} {data.price?.toLocaleString()}
          </p>
          <p className={`text-sm font-bold ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(data.changePercent)}%
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '52W High', value: data.high52w?.toLocaleString() },
          { label: '52W Low', value: data.low52w?.toLocaleString() },
          { label: 'P/E Ratio', value: data.peRatio?.toFixed(2) || 'N/A' },
          { label: 'Volume', value: data.volume ? (data.volume / 1e6).toFixed(2) + 'M' : 'N/A' },
        ].map(item => (
          <div key={item.label} className="bg-white/70 rounded-lg p-3">
            <p className="text-xs text-slate-500 font-semibold">{item.label}</p>
            <p className="text-sm font-black text-slate-800">{item.value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SentimentBreakdown({ breakdown }) {
  const total = (breakdown?.positive || 0) + (breakdown?.negative || 0) + (breakdown?.neutral || 0);
  if (total === 0) return null;

  const bars = [
    { label: 'Bullish', count: breakdown.positive, color: 'bg-emerald-500', pct: Math.round((breakdown.positive / total) * 100) },
    { label: 'Bearish', count: breakdown.negative, color: 'bg-red-500', pct: Math.round((breakdown.negative / total) * 100) },
    { label: 'Neutral', count: breakdown.neutral, color: 'bg-slate-400', pct: Math.round((breakdown.neutral / total) * 100) },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Source Sentiment Breakdown</p>
      {bars.map(b => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 w-14">{b.label}</span>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${b.color} rounded-full transition-all duration-700`}
              style={{ width: `${b.pct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 w-10 text-right">{b.count} ({b.pct}%)</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TruthAgent() {
  const [mode, setMode] = useState('text'); // 'text' | 'pdf' | 'voice'
  const [query, setQuery] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── Voice input ──────────────────────────────────────────────────────────
  const startVoiceInput = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input is not supported in your browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      setIsListening(false);
      setError('Voice recognition error: ' + e.error);
    };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      setMode('voice');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopVoiceInput = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    setResult(null);

    if (mode === 'pdf') {
      if (!file) return setError('Please upload a PDF file.');
      setLoading(true);
      try {
        const form = new FormData();
        form.append('pdf', file);
        const { data } = await axios.post(`${API_BASE}/truth/analyze-pdf`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data.error) return setError(data.message || 'Analysis restricted.');
        setResult(data);
      } catch (e) {
        setError(e.response?.data?.error || 'PDF analysis failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!query.trim()) return setError('Please enter a query or use voice input.');
      setLoading(true);
      try {
        const { data } = await axios.post(`${API_BASE}/truth/analyze`, { query, mode });
        if (data.error) return setError(data.message || 'Analysis restricted.');
        setResult(data);
      } catch (e) {
        setError(e.response?.data?.error || 'Analysis failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const reset = () => {
    setResult(null);
    setError('');
    setQuery('');
    setFile(null);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
              <span className="text-white text-lg">🔍</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Truth Agent</h1>
              <p className="text-xs text-slate-500 font-medium">AI-Powered Financial Fact-Checker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600">Live Analysis</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* ── Hero ── */}
        {!result && !loading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700 mb-5">
              ✦ Powered by OpenAI · HuggingFace FinBERT · NewsAPI
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              Can You Trust This Financial Claim?
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Analyze stocks, markets, and financial reports using AI-powered sentiment analysis and cross-source verification.
            </p>
          </div>
        )}

        {/* ── Input Card ── */}
        {!result && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
            {/* Mode Tabs */}
            <div className="flex border-b border-slate-100">
              {[
                { id: 'text', icon: '💬', label: 'Text Query' },
                { id: 'pdf', icon: '📄', label: 'PDF Report' },
                { id: 'voice', icon: '🎙️', label: 'Voice Input' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setMode(tab.id); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
                    mode === tab.id
                      ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-8 space-y-6">
              {/* Text Mode */}
              {(mode === 'text' || mode === 'voice') && (
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    {mode === 'voice' ? '🎙️ Transcribed Query' : '💬 Enter your financial query'}
                  </label>
                  <div className="relative">
                    <textarea
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="e.g., Is Reliance Industries a good long-term investment? What does the market think of HDFC Bank earnings?"
                      rows={4}
                      className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 transition-all"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-medium">
                      {query.length} chars
                    </div>
                  </div>

                  {/* Voice Button */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={isListening ? stopVoiceInput : startVoiceInput}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isListening
                          ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{isListening ? '⏹' : '🎙️'}</span>
                      {isListening ? 'Stop Recording' : 'Start Voice Input'}
                    </button>
                    {isListening && (
                      <span className="text-xs text-red-500 font-semibold animate-pulse">
                        Listening...
                      </span>
                    )}
                  </div>

                  {/* Example queries */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-slate-400 font-semibold mr-1">Try:</span>
                    {[
                      'Is Reliance a good buy?',
                      'HDFC Bank earnings outlook',
                      'Should I invest in Nifty 50?',
                      'Tesla stock analysis 2024',
                    ].map(eg => (
                      <button
                        key={eg}
                        onClick={() => setQuery(eg)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full hover:bg-indigo-100 transition-colors border border-indigo-100"
                      >
                        {eg}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Mode */}
              {mode === 'pdf' && (
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                    file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const dropped = e.dataTransfer.files[0];
                    if (dropped?.type === 'application/pdf') setFile(dropped);
                    else setError('Only PDF files are accepted.');
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={e => setFile(e.target.files[0])}
                  />
                  {file ? (
                    <div>
                      <p className="text-4xl mb-3">📄</p>
                      <p className="text-emerald-700 font-bold text-sm">{file.name}</p>
                      <p className="text-slate-500 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-5xl mb-4">📂</p>
                      <p className="text-slate-700 font-bold">Drop your PDF here or click to browse</p>
                      <p className="text-slate-400 text-sm mt-2">Financial reports, balance sheets, annual reports · Max 10MB</p>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-base rounded-2xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing sources…
                  </>
                ) : (
                  <>🔍 Run Truth Analysis</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Loading State ── */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3">Analyzing Financial Data…</h3>
            <div className="space-y-2 text-sm text-slate-500">
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Fetching latest news articles
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
                Running FinBERT sentiment analysis
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
                GPT-4o cross-referencing sources
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: '0.9s' }} />
                Computing trust score
              </p>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {result && !loading && (
          <div className="space-y-6 animate-in fade-in">
            {/* Query Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Analysis Result</p>
                <p className="text-slate-700 font-semibold mt-1 text-sm line-clamp-1">
                  "{result.query?.slice(0, 100)}{result.query?.length > 100 ? '…' : ''}"
                </p>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
              >
                ← New Query
              </button>
            </div>

            {/* Top Row: Trust + Sentiment + Bias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Trust Score */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Trust Score</p>
                <TrustMeter score={result.trustScore} />
              </div>

              {/* Sentiment + Bias */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col justify-center gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Market Sentiment</p>
                  <SentimentBadge sentiment={result.sentiment} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Bias Level</p>
                  <BiasBadge bias={result.biasDetected} />
                  {result.biasExplanation && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{result.biasExplanation}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Signal Strength</p>
                  <SignalStrengthBadge strength={result.signalStrength || 'Moderate Signal'} />
                  {result.agreementScore !== undefined && (
                    <p className="text-xs text-slate-500 mt-2">
                      Source agreement: <span className="font-bold text-slate-700">{result.agreementScore}%</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Sentiment Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
                <SentimentBreakdown breakdown={result.sentimentBreakdown} />
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold">
                    📰 {result.totalSources} sources analyzed ·{' '}
                    {result.conflictDetected ? (
                      <span className="text-amber-600 font-bold">⚡ Conflicting signals detected</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">✓ Sources generally aligned</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Market Data */}
            {result.marketData && <MarketDataCard data={result.marketData} />}

            {/* Explanation */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">🧠</span>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">AI Analysis & Explanation</h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm">{result.explanation}</p>

              {/* Key Insights */}
              {result.keyInsights?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Key Insights</p>
                  <ul className="space-y-2">
                    {result.keyInsights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-indigo-500 font-black mt-0.5">✦</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Conflicts */}
            {result.conflicts?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">⚡</span>
                  <h3 className="text-sm font-black text-amber-800 uppercase tracking-wide">Conflicting Signals Detected</h3>
                </div>
                <ul className="space-y-2">
                  {result.conflicts.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                      <span className="font-bold mt-0.5 text-amber-600">⚠</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PDF Extract Preview */}
            {result.extractedText && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Extracted PDF Text (Preview)</p>
                <p className="text-sm text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">{result.extractedText}</p>
              </div>
            )}

            {/* Sources */}
            {result.sources?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                    📰 News Sources ({result.sources.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    Analyzed {new Date(result.analyzedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.sources.map((s, i) => (
                    <SourceCard key={i} source={s} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <p className="text-center text-xs text-slate-400 pb-4">
              ⚠️ Truth Agent is for informational purposes only. This is not financial advice.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}