import { useMemo } from "react";

// Renders bold (**text**), bullet lines (• ...), empty lines, and plain lines
const renderContent = (text) => {
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    // Render bold text (**text**)
    const renderBold = (str) =>
      str.split(/(\*\*[^*]+\*\*)/g).map((part, partIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

    // Bullet: any line that starts with "•" (with or without emoji after)
    if (line.startsWith("•")) {
      const bulletText = line.slice(1).trimStart(); // remove "•" and leading space
      return (
        <div key={lineIdx} className="message-bullet">
          <span className="bullet-dot">•</span>
          <span>{renderBold(bulletText)}</span>
        </div>
      );
    }

    if (line.trim() === "") {
      return <div key={lineIdx} className="message-spacer" />;
    }

    return (
      <div key={lineIdx} className="message-line">
        {renderBold(line)}
      </div>
    );
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatMessage({ message }) {
  const isBot = message.role === "assistant";
  const renderedContent = useMemo(
    () => renderContent(message.content),
    [message.content]
  );

  return (
    <div
      className={`chat-message ${isBot ? "chat-message--bot" : "chat-message--user"}`}
    >
      {isBot && (
        <div className="message-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
      )}

      <div className="message-content">
        <div
          className={`message-bubble ${
            isBot ? "message-bubble--bot" : "message-bubble--user"
          }`}
        >
          {renderedContent}
        </div>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>

      {!isBot && (
        <div className="message-avatar message-avatar--user" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
      )}
    </div>
  );
}