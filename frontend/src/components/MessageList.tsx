"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/types/message";

interface Props {
  messages: Message[];
  currentUserId: number;
  selectedUsername: string;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const canEdit = (createdAt: string) => {
  const created = new Date(createdAt).getTime();
  const now = new Date().getTime();
  return now - created < 15 * 60 * 1000;
};

export default function MessageList({ messages, currentUserId, selectedUsername, onDelete, onEdit }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const handlePressStart = (id: number, isMine: boolean) => {
    if (!isMine) return;
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setHoveredId(id);
    }, 600);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLengthRef.current = messages.length;
  }, [messages]);

  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.message);
    setHoveredId(null);
  };

  const submitEdit = (id: number) => {
    if (editText.trim()) onEdit(id, editText.trim());
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => { setEditingId(null); setEditText(""); };

  // Group messages by date
  const grouped: { date: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = new Date(msg.created_at).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) last.msgs.push(msg);
    else grouped.push({ date, msgs: [msg] });
  });

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--chat-bg)" }}>
        <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: "16px", padding: "12px 24px", fontSize: "13px", color: "var(--text-muted)", boxShadow: "0 2px 8px rgba(233,30,140,0.08)", border: "1px solid var(--border)" }}>
          💕 Say hello to {selectedUsername}!
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 5%", display: "flex", flexDirection: "column", gap: "2px", background: "var(--chat-bg)" }}>
      {grouped.map(({ date, msgs }) => (
        <div key={date}>
          {/* Date separator */}
          <div style={{ display: "flex", justifyContent: "center", margin: "14px 0" }}>
            <span style={{ background: "rgba(255,255,255,0.9)", borderRadius: "20px", padding: "4px 14px", fontSize: "11px", color: "var(--text-muted)", boxShadow: "0 1px 4px rgba(233,30,140,0.08)", border: "1px solid var(--border)", fontWeight: 500 }}>
              {date}
            </span>
          </div>

          {msgs.map((msg, i) => {
            const isMine = msg.sender_id === currentUserId;
            const isFirst = i === 0 || msgs[i - 1].sender_id !== msg.sender_id;
            const isHovered = hoveredId === msg.id;
            const isEditing = editingId === msg.id;

            return (
              <div key={msg.id}
                style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginTop: isFirst ? "10px" : "2px", position: "relative" }}
                onMouseDown={() => handlePressStart(msg.id, isMine)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={() => handlePressStart(msg.id, isMine)}
                onTouchEnd={handlePressEnd}
                onTouchMove={handlePressEnd}
              >
                <div style={{ maxWidth: "75%" }}>

                  {/* Edit/Delete action buttons — only on own messages on hover */}
                  {isMine && isHovered && !isEditing && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", marginBottom: "4px" }}>
                      <div style={{ display: "flex", gap: "3px" }}>
                        {canEdit(msg.created_at) && (
                          <button onClick={() => startEdit(msg)}
                            style={{ display: "flex", alignItems: "center", gap: "3px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", color: "var(--text-secondary)", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit
                          </button>
                        )}
                        <button onClick={() => { setConfirmDeleteId(msg.id); setHoveredId(null); }}
                          style={{ display: "flex", alignItems: "center", gap: "3px", background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", color: "var(--error)", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          Delete
                        </button>
                        <button onClick={() => setHoveredId(null)}
                          style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "6px", padding: "3px 6px", fontSize: "11px", color: "var(--text-muted)", cursor: "pointer" }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete confirmation popup */}
                  {confirmDeleteId === msg.id && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", marginBottom: "4px" }}>
                      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "8px", minWidth: "160px" }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", textAlign: "center" }}>Delete this message?</p>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => setConfirmDeleteId(null)}
                            style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "6px", padding: "3px", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", cursor: "pointer" }}>
                            No
                          </button>
                          <button onClick={() => { onDelete(msg.id); setConfirmDeleteId(null); }}
                            style={{ flex: 1, background: "linear-gradient(135deg, #ff4db8, #e91e8c)", border: "none", borderRadius: "6px", padding: "3px", fontSize: "11px", fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                            Yes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit input */}
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <input
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") submitEdit(msg.id); if (e.key === "Escape") cancelEdit(); }}
                        style={{ background: "var(--surface)", border: "1.5px solid var(--primary)", borderRadius: "12px", padding: "8px 12px", fontSize: "14px", color: "var(--text)", outline: "none", width: "100%" }}
                      />
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button onClick={cancelEdit}
                          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "4px 12px", fontSize: "12px", color: "var(--text-muted)", cursor: "pointer" }}>
                          Cancel
                        </button>
                        <button onClick={() => submitEdit(msg.id)}
                          style={{ background: "linear-gradient(135deg, #ff4db8, #e91e8c)", border: "none", borderRadius: "8px", padding: "4px 12px", fontSize: "12px", color: "#fff", cursor: "pointer" }}>
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: isMine ? "linear-gradient(135deg, #ff4db8, #e91e8c)" : "var(--surface)",
                      color: isMine ? "#fff" : "var(--text)",
                      padding: "6px 12px 4px",
                      borderRadius: isMine ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      boxShadow: isMine ? "0 3px 12px rgba(233,30,140,0.25)" : "0 1px 4px rgba(0,0,0,0.08)",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      wordBreak: "break-word",
                      border: isMine ? "none" : "1px solid var(--border)",
                    }}>
                      <span style={{ display: "block", paddingRight: "52px" }}>{msg.message}</span>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        {msg.is_edited && <span style={{ fontSize: "10px", fontStyle: "italic", color: isMine ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>Edited ·</span>}
                        <span style={{ fontSize: "10px", color: isMine ? "rgba(255,255,255,0.7)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
