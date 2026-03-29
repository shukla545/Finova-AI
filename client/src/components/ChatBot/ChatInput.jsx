import { useState, forwardRef } from "react";

const ChatInput = forwardRef(function ChatInput(
  {
    onSend,
    isLoading,
    placeholder = "Ask about your portfolio, market news...",
  },
  ref,
) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSend(value);
      setValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-input-area">
      <div className="chat-input-wrapper">
        <textarea
          ref={ref}
          className="chat-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          aria-label="Type your message"
        />
        <button
          className={`send-btn ${value.trim() && !isLoading ? "send-btn--active" : ""}`}
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          aria-label="Send message"
          type="button"
        >
          {isLoading ? (
            <svg
              className="spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
      <p className="chat-input-hint">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
});

export default ChatInput;
