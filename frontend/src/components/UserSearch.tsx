"use client";

import { useState } from "react";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { User } from "@/types/user";

interface Props {
  currentUser: User;
  selectedUser: User | null;
  recentChats: User[];
  searchQuery: string;
  searchResults: User[];
  searching: boolean;
  onlineUsers: Set<number>;
  unreadCounts: Record<number, number>;
  lastMessages: Record<number, string>;
  onSearchChange: (query: string) => void;
  onSelectUser: (user: User) => void;
  onLogout: () => void;
  onNameUpdate: (name: string) => void;
  isMobile: boolean;
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

export default function UserSearch({
  currentUser, selectedUser, recentChats, searchQuery, searchResults,
  searching, onlineUsers, unreadCounts, lastMessages,
  onSearchChange, onSelectUser, onLogout, onNameUpdate, isMobile,
}: Props) {
  const [showProfile, setShowProfile] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === currentUser.name) { setEditingName(false); return; }
    setSavingName(true);
    setNameError("");
    try {
      const res = await api.put("/users/profile", { name: nameInput.trim() });
      onNameUpdate(res.data.name);
      getSocket().emit("name_updated", { name: res.data.name });
      setEditingName(false);
    } catch {
      setNameError("Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div style={{
      width: isMobile ? "100%" : "340px",
      minWidth: isMobile ? "unset" : "340px",
      display: "flex", flexDirection: "column",
      background: "var(--surface)",
      borderRight: isMobile ? "none" : "1px solid var(--border)",
      boxShadow: isMobile ? "none" : "2px 0 12px rgba(233,30,140,0.06)",
      height: isMobile ? "100dvh" : "auto",
      position: "relative",
    }}>

      {/* Header */}
      <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #ff4db8, #e91e8c)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          {/* Clickable avatar */}
          <button onClick={() => { setShowProfile(!showProfile); setEditingName(false); setNameInput(currentUser.name); setNameError(""); }}
            style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 800, color: "#fff", border: "2px solid rgba(255,255,255,0.4)", cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.4)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
          >
            {getInitial(currentUser.name)}
          </button>

          <div>
            <p style={{ fontWeight: 800, fontSize: "16px", color: "#fff" }}>ChatApp</p>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#48bb78", display: "inline-block", flexShrink: 0 }} />
              {currentUser.name}
            </p>
          </div>
        </div>
        <button onClick={onLogout} title="Logout"
          style={{ background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", padding: "7px", borderRadius: "50%", transition: "background 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* Profile popup */}
      {showProfile && (
        <div style={{ position: "absolute", top: "72px", left: "16px", right: "16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", boxShadow: "0 8px 32px rgba(233,30,140,0.12)", zIndex: 100, overflow: "hidden" }}>

          {/* Popup header */}
          <div style={{ background: "linear-gradient(135deg, #ff4db8, #e91e8c)", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 800, color: "#fff", border: "3px solid rgba(255,255,255,0.4)" }}>
              {getInitial(currentUser.name)}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 800, fontSize: "16px", color: "#fff" }}>{currentUser.name}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginTop: "2px" }}>{currentUser.email}</p>
            </div>
          </div>

          {/* Popup body */}
          <div style={{ padding: "16px" }}>

            {/* Name field */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>Display Name</label>
                {!editingName && (
                  <button onClick={() => { setEditingName(true); setNameInput(currentUser.name); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                )}
              </div>

              {editingName ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={e => { setNameInput(e.target.value); setNameError(""); }}
                    onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                    style={{ width: "100%", background: "var(--surface-2)", border: "1.5px solid var(--primary)", borderRadius: "10px", padding: "9px 12px", fontSize: "14px", color: "var(--text)", outline: "none" }}
                  />
                  {nameError && <p style={{ fontSize: "12px", color: "var(--error)" }}>{nameError}</p>}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setEditingName(false)}
                      style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", fontSize: "13px", color: "var(--text-muted)", cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button onClick={handleSaveName} disabled={savingName}
                      style={{ flex: 1, background: "linear-gradient(135deg, #ff4db8, #e91e8c)", border: "none", borderRadius: "8px", padding: "8px", fontSize: "13px", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                      {savingName ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: "14px", color: "var(--text)", background: "var(--surface-2)", padding: "9px 12px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  {currentUser.name}
                </p>
              )}
            </div>

            {/* Email field — read only */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Email</label>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", background: "var(--surface-2)", padding: "9px 12px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                {currentUser.email}
              </p>
            </div>

            {/* Close button */}
            <button onClick={() => setShowProfile(false)}
              style={{ width: "100%", marginTop: "14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "9px", fontSize: "13px", color: "var(--text-muted)", cursor: "pointer", fontWeight: 600 }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <div
          style={{ position: "relative", background: "var(--surface-2)", borderRadius: "24px", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", transition: "border-color 0.2s" }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--primary)")}
          onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <svg style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => onSearchChange(e.target.value)}
            style={{ width: "100%", background: "none", border: "none", outline: "none", padding: "10px 14px 10px 38px", fontSize: "14px", color: "var(--text)", borderRadius: "24px" }}
          />
          {searchQuery && (
            <button onClick={() => onSearchChange("")} style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {searchQuery ? (
          <>
            {searching && <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>Searching...</div>}
            {!searching && searchResults.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                No users found for &quot;{searchQuery}&quot;
              </div>
            )}
            {searchResults.map(user => (
              <button key={user.id} onClick={() => onSelectUser(user)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: getGradient(user.id), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {getInitial(user.name)}
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>{user.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.email}</p>
                </div>
              </button>
            ))}
          </>
        ) : recentChats.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>No chats yet</p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>Search for someone to start chatting</p>
          </div>
        ) : (
          recentChats.map(user => {
            const isSelected = selectedUser?.id === user.id;
            const hasUnread = unreadCounts[user.id] > 0;
            const isOnline = onlineUsers.has(user.id);
            return (
              <button key={user.id} onClick={() => onSelectUser(user)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px", background: isSelected ? "var(--primary-pale)" : hasUnread ? "#fff5f8" : "none", border: "none", borderBottom: "1px solid var(--border)", borderLeft: isSelected ? "3px solid var(--primary)" : hasUnread ? "3px solid var(--primary)" : "3px solid transparent", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--surface-2)"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = hasUnread ? "#fff5f8" : "none"; }}
              >
                <div style={{ flexShrink: 0 }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: getGradient(user.id), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800, color: "#fff" }}>
                    {getInitial(user.name)}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: "15px", fontWeight: hasUnread ? 800 : 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.name}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, marginLeft: "6px" }}>
                      {hasUnread && (
                        <span style={{ background: "var(--primary)", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {unreadCounts[user.id] > 9 ? "9+" : unreadCounts[user.id]}
                        </span>
                      )}
                      <p style={{ fontSize: "11px", color: isOnline ? "#48bb78" : "#fc8181", fontWeight: 600 }}>
                        {isOnline ? "● online" : "● offline"}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: hasUnread ? "var(--primary)" : "var(--text-muted)", fontWeight: hasUnread ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "2px" }}>
                    {lastMessages[user.id] || "Tap to open chat"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
