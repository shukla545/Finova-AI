import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import "./ChatBot.css";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 Welcome to **FinovaAI**! I'm **FinBot**, your AI financial assistant.\n\nI can help you with:\n• 📊 Navigating your Portfolio \n• 📰 Finding news on Market Pulse\n• 🔒 Understanding your data security\n• ⚠️ Detecting fraud via Truth Agent\n\nWhat would you like to explore?",
  timestamp: new Date(),
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const sendMessage = async (userText) => {
    if (!userText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // ✅ Clean API payload — strip welcome, strip empty, only role + content
    const apiMessages = messages
      .filter(
        (m) =>
          m.id !== "welcome" &&
          typeof m.content === "string" &&
          m.content.trim().length > 0 &&
          (m.role === "user" || m.role === "assistant")
      )
      .map((m) => ({ role: m.role, content: m.content }));

    // ✅ Always push the new user message
    apiMessages.push({ role: "user", content: userMessage.content });

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response.");
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      if (!isOpen) setHasNewMessage(true);

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    setHasNewMessage(false);
  };

  return (
    <div className="skillbridge-chatbot">
      {/* Chat Panel */}
      <div className={`chat-panel ${isOpen ? "chat-panel--open" : ""}`}>

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header__info">
            <div className="chat-header__avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </div>
            <div>
              <h3 className="chat-header__name">FinBot</h3>
              <span className="chat-header__status">
                <span className="status-dot"></span>
                Online · FinovaAI Assistant
              </span>
            </div>
          </div>
          <div className="chat-header__actions">
            <button
              className="icon-btn"
              onClick={clearChat}
              title="Clear chat"
              aria-label="Clear chat history"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"></path>
                <path d="M10 11v6M14 11v6"></path>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"></path>
              </svg>
            </button>
            <button
              className="icon-btn"
              onClick={toggleChat}
              title="Close chat"
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" role="log" aria-live="polite">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="chat-message chat-message--bot">
              <div className="message-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
              <div className="message-bubble message-bubble--bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="chat-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="quick-suggestions">
            {[
              "How do I check my portfolio risk?",
              "What is Truth Agent?",
              "How does the SMS alert work?",
              "Is my data safe on FinovaAI?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                className="suggestion-chip"
                onClick={() => sendMessage(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <ChatInput
          ref={inputRef}
          onSend={sendMessage}
          isLoading={isLoading}
          placeholder="Ask about your portfolio, market news..."
        />
      </div>

      {/* Floating Button */}
      <button
        className={`chat-toggle-btn ${isOpen ? "chat-toggle-btn--open" : ""}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Chat with FinBot"}
        title="FinBot — FinovaAI Assistant"
      >
        {hasNewMessage && !isOpen && (
          <span className="notification-badge">1</span>
        )}
        <span className="toggle-icon toggle-icon--chat">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        </span>
        <span className="toggle-icon toggle-icon--close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </span>
      </button>
    </div>
  );
}