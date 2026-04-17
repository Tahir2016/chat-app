"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { logout } from "@/lib/auth";
import UserSearch from "@/components/UserSearch";
import ChatBox from "@/components/ChatBox";
import type { Message } from "@/types/message";
import type { User } from "@/types/user";

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [recentChats, setRecentChats] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [lastMessages, setLastMessages] = useState<Record<number, string>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [lastMessageTimes, setLastMessageTimes] = useState<Record<number, string>>({});
  const [lastSeen, setLastSeen] = useState<Record<number, string>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Auth ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser({ id: payload.id, name: payload.name, email: "" });
      // fetch full profile to get email
      api.get("/users/profile").then((res) => {
        setCurrentUser({ id: res.data.id, name: res.data.name, email: res.data.email });
      }).catch(() => {});
    } catch { router.replace("/login"); }
  }, [router]);

  // ── Socket events ──
  useEffect(() => {
    if (!currentUser) return;
    const socket = getSocket();

    socket.on("receive_message", (msg: Message) => {
      setMessages((prev) => prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]);
      const otherId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
      if (otherId === currentUser.id) return;
      setLastMessages((prev) => ({ ...prev, [otherId]: msg.message }));
      setLastMessageTimes((prev) => ({ ...prev, [otherId]: msg.created_at }));
      if (msg.sender_id !== currentUser.id) {
        setSelectedUser((selected) => {
          if (!selected || selected.id !== msg.sender_id) {
            setUnreadCounts((prev) => ({ ...prev, [msg.sender_id]: (prev[msg.sender_id] || 0) + 1 }));
          }
          return selected;
        });
      }
      if (msg.sender_id === currentUser.id) {
        setRecentChats((prev) => {
          const exists = prev.find((u) => u.id === otherId);
          if (exists) return [exists, ...prev.filter((u) => u.id !== otherId)];
          return prev;
        });
      }
    });

    socket.on("user_online", ({ userId }: { userId: number }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });
    socket.on("user_offline", ({ userId, lastSeen: ls }: { userId: number; lastSeen: string }) => {
      setOnlineUsers((prev) => { const s = new Set(prev); s.delete(userId); return s; });
      if (ls) setLastSeen((prev) => ({ ...prev, [userId]: ls }));
    });
    socket.on("user_name_updated", ({ userId, name }: { userId: number; name: string }) => {
      setRecentChats((prev) => prev.map((u) => u.id === userId ? { ...u, name } : u));
      setSelectedUser((prev) => prev?.id === userId ? { ...prev, name } : prev);
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("user_name_updated");
    };
  }, [currentUser]);

  // ── Load conversations ──
  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const res = await api.get("/messages/conversations");
        const rows: { other_id: number; name: string; email: string; last_seen: string; last_message: string; last_message_time: string; unread_count: number }[] = res.data;
        const filtered = rows.filter((r) => r.other_id !== currentUser.id);
        setRecentChats(filtered.map((r) => ({ id: r.other_id, name: r.name, email: r.email })));
        const lm: Record<number, string> = {};
        const lt: Record<number, string> = {};
        const uc: Record<number, number> = {};
        const ls: Record<number, string> = {};
        filtered.forEach((r) => {
          lm[r.other_id] = r.last_message;
          lt[r.other_id] = r.last_message_time;
          if (r.unread_count > 0) uc[r.other_id] = r.unread_count;
          if (r.last_seen) ls[r.other_id] = r.last_seen;
        });
        setLastMessages(lm);
        setLastMessageTimes(lt);
        setUnreadCounts(uc);
        setLastSeen(ls);
      } catch { /* ignore */ }
    };
    load();
  }, [currentUser]);

  // ── Load messages ──
  const loadMessages = useCallback(async (user: User) => {
    try {
      const res = await api.get(`/messages/${user.id}`);
      setMessages(res.data);
      getSocket().emit("join_room", { receiverId: user.id });
    } catch { setMessages([]); }
  }, []);

  useEffect(() => {
    if (selectedUser) loadMessages(selectedUser);
  }, [selectedUser, loadMessages]);

  // ── Search ──
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?query=${searchQuery}`);
        setSearchResults(res.data.filter((u: User) => u.id !== currentUser?.id));
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 400);
  }, [searchQuery, currentUser]);

  // ── Select user ──
  const selectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
    setUnreadCounts((prev) => { const n = { ...prev }; delete n[user.id]; return n; });
    api.put(`/messages/read/${user.id}`).catch(() => {});
    setRecentChats((prev) => {
      if (prev.find((u) => u.id === user.id)) return prev;
      return [...prev, user];
    });
    if (isMobile) setShowChat(true); // on mobile go to chat screen
  };

  // ── Send message ──
  const sendMessage = async (text: string) => {
    if (!selectedUser) return;
    try {
      const res = await api.post("/messages", { receiverId: selectedUser.id, message: text });
      const savedMsg = res.data;
      setMessages((prev) => prev.find((m) => m.id === savedMsg.id) ? prev : [...prev, savedMsg]);
      setLastMessages((prev) => ({ ...prev, [selectedUser.id]: text }));
      setLastMessageTimes((prev) => ({ ...prev, [selectedUser.id]: savedMsg.created_at }));
      setRecentChats((prev) => {
        const exists = prev.find((u) => u.id === selectedUser.id);
        if (exists) return [exists, ...prev.filter((u) => u.id !== selectedUser.id)];
        return [selectedUser, ...prev];
      });
      getSocket().emit("send_message", { receiverId: selectedUser.id, message: text, savedMessage: savedMsg });
    } catch { /* ignore */ }
  };

  const handleBack = () => { setShowChat(false); setSelectedUser(null); };
  const handleLogout = () => { disconnectSocket(); logout(); router.replace("/login"); };
  const handleNameUpdate = (name: string) => { setCurrentUser((prev) => prev ? { ...prev, name } : prev); };

  // ── Delete message ──
  const deleteMessage = async (id: number) => {
    try {
      await api.delete(`/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch { /* ignore */ }
  };

  // ── Edit message ──
  const editMessage = async (id: number, newText: string) => {
    try {
      const res = await api.put(`/messages/${id}`, { message: newText });
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, message: res.data.message, is_edited: true, edited_at: res.data.edited_at } : m));
    } catch { /* ignore */ }
  };

  if (!currentUser) return null;

  // ── Mobile layout ──
  if (isMobile) {
    return (
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
        {!showChat ? (
          <UserSearch
            currentUser={currentUser}
            selectedUser={selectedUser}
            recentChats={recentChats}
            searchQuery={searchQuery}
            searchResults={searchResults}
            searching={searching}
            onlineUsers={onlineUsers}
            unreadCounts={unreadCounts}
            lastMessages={lastMessages}
            onSearchChange={setSearchQuery}
            onSelectUser={selectUser}
            onLogout={handleLogout}
            onNameUpdate={handleNameUpdate}
            isMobile={true}
          />
        ) : (
          <ChatBox
            selectedUser={selectedUser!}
            currentUser={currentUser}
            messages={messages}
            isOnline={onlineUsers.has(selectedUser!.id)}
            lastSeen={lastSeen[selectedUser!.id]}
            onSend={sendMessage}
            onBack={handleBack}
            onDelete={deleteMessage}
            onEdit={editMessage}
            isMobile={true}
          />
        )}
      </div>
    );
  }

  // ── Desktop layout ──
  return (
    <div style={{ height: "100vh", display: "flex", background: "var(--bg)", overflow: "hidden" }}>
      <UserSearch
        currentUser={currentUser}
        selectedUser={selectedUser}
        recentChats={recentChats}
        searchQuery={searchQuery}
        searchResults={searchResults}
        searching={searching}
        onlineUsers={onlineUsers}
        unreadCounts={unreadCounts}
        lastMessages={lastMessages}
        onSearchChange={setSearchQuery}
        onSelectUser={selectUser}
        onLogout={handleLogout}
        onNameUpdate={handleNameUpdate}
        isMobile={false}
      />

      {selectedUser ? (
        <ChatBox
          selectedUser={selectedUser}
          currentUser={currentUser}
          messages={messages}
          isOnline={onlineUsers.has(selectedUser.id)}
          lastSeen={lastSeen[selectedUser.id]}
          onSend={sendMessage}
          onDelete={deleteMessage}
          onEdit={editMessage}
          isMobile={false}
        />
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", background: "var(--chat-bg)" }}>
          <div style={{ fontSize: "80px" }}>💬</div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)" }}>Your Chats</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px", maxWidth: "280px", lineHeight: 1.6 }}>
              Search for a friend on the left and start a conversation 💕
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "var(--surface)", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(233,30,140,0.06)" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>🔒 End-to-end encrypted</span>
          </div>
        </div>
      )}
    </div>
  );
}
