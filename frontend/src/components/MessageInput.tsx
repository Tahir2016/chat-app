"use client";

import { useState } from "react";

interface Props {
  selectedUsername: string;
  onSend: (text: string) => void;
}

export default function MessageInput({ selectedUsername, onSend }: Props) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ padding: "12px 20px", background: "var(--surface)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
      <div
        style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--surface-2)", borderRadius: "28px", padding: "8px 18px", border: "1.5px solid var(--border)", transition: "border-color 0.2s" }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <input
          type="text"
          placeholder={`Message ${selectedUsername}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "14px", color: "var(--text)" }}
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!input.trim()}
        style={{ width: "46px", height: "46px", borderRadius: "50%", background: input.trim() ? "linear-gradient(135deg, #ff4db8, #e91e8c)" : "var(--border)", border: "none", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", boxShadow: input.trim() ? "0 4px 14px rgba(233,30,140,0.35)" : "none" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
