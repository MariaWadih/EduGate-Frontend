// src/components/molecules/AIAssistant/AIAssistantWidget.jsx

import { useState, useRef, useEffect } from "react";
import { sendMessageToAI } from "../../../services/aiService";
import "./AIAssistantWidget.css";

// ── Icons (inline SVG, no extra dependency needed) ──────────────────────────

const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <line x1="12" y1="7" x2="12" y2="11" />
    <line x1="8" y1="15" x2="8" y2="15" strokeWidth="3" strokeLinecap="round" />
    <line x1="12" y1="15" x2="12" y2="15" strokeWidth="3" strokeLinecap="round" />
    <line x1="16" y1="15" x2="16" y2="15" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ── Component ────────────────────────────────────────────────────────────────

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hi! 👋 I'm your school assistant. Ask me anything!",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 100)}px`;
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { id: Date.now(), role: "user", text, time: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const reply = await sendMessageToAI(text);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: reply, time: new Date() },
      ]);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Could not reach the assistant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter (not Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="ai-chat-window" role="dialog" aria-label="AI Assistant">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-avatar"><BotIcon /></div>
              <div>
                <h4>School Assistant</h4>
                <p>Powered by AI · Always here to help</p>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)} aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message ${msg.role}`}>
                <div className="ai-bubble">{msg.text}</div>
                <span className="ai-message-time">{formatTime(msg.time)}</span>
              </div>
            ))}

            {isLoading && (
              <div className="ai-message assistant">
                <div className="ai-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {error && <div className="ai-error">⚠️ {error}</div>}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-input-area">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask something…"
              disabled={isLoading}
            />
            <button
              className="ai-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Action Button ── */}
      <button
        className="ai-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <CloseIcon /> : <BotIcon />}
      </button>
    </>
  );
}