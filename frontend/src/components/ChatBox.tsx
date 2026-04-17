"use client";

import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import type { Message } from "@/types/message";
import type { User } from "@/types/user";

interface Props {
  selectedUser: User;
  currentUser: User;
  messages: Message[];
  isOnline: boolean;
  lastSeen?: string;
  onSend: (text: string) => void;
  onBack?: () => void;
  isMobile?: boolean;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

const avatarGradients = [
  "linear-gradient(135deg,#ff4db8,#e91e8c)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#fda085,#f6d365)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ff9a9e,#fecfef)",
  "linear-gradient(135deg,#f77062,#fe5196)",
];

const getGradient = (id: number) => avatarGradients[id % avatarGradients.length];
const getInitial = (name: string) => name?.charAt(0).toUpperCase() || "?";

export default function ChatBox({ selectedUser, currentUser, messages, isOnline, lastSeen, onSend, onBack, isMobile, onDelete, onEdit }: Props) {

  const formatLastSeen = (ls: string) => {
    const date = new Date(ls);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return `last seen today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return `last seen yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return `last seen ${date.toLocaleDateString([], { day: "numeric", month: "short" })} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: isMobile ? "100dvh" : "auto" }}>

      {/* Header */}
      <div style={{ padding: "12px 16px", background: "linear-gradient(135deg, #ff4db8, #e91e8c)", display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Back button — mobile only */}
        {isMobile && onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", padding: "6px", borderRadius: "50%", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <div style={{ position: "relative" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: getGradient(selectedUser.id), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 800, color: "#fff" }}>
            {getInitial(selectedUser.name)}
          </div>
          <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", borderRadius: "50%", background: isOnline ? "#48bb78" : "#fc8181", border: "2px solid #fff" }} />
        </div>

        <div>
          <p style={{ fontWeight: 700, fontSize: "15px", color: "#fff" }}>{selectedUser.name}</p>
          <p style={{ fontSize: "12px", color: isOnline ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            {isOnline ? "● online" : lastSeen ? formatLastSeen(lastSeen) : "● offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUser.id}
        selectedUsername={selectedUser.name}
        onDelete={onDelete}
        onEdit={onEdit}
      />

      {/* Input */}
      <MessageInput selectedUsername={selectedUser.name} onSend={onSend} />
    </div>
  );
}
