"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Search, Send } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Message {
  senderId: string | null; // null for admin
  content: string;
}

export default function AdminMessagesPage() {
  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // UI / UX state
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");

  // Refs
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const conversationRef = useRef<HTMLDivElement | null>(null);

  // --- Responsive helpers
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // --- Fetch users (with skeleton)
  useEffect(() => {
    const run = async () => {
      try {
        setLoadingUsers(true);
        const res = await axios.get<User[]>("/api/message/messaged-users");
        setUsers(res.data ?? []);
        setError("");
      } catch (err: unknown) {
        const e = err as AxiosError<{ message?: string }>;
        setError(e.response?.data?.message ?? e.message ?? "Failed to load users.");
      } finally {
        setLoadingUsers(false);
      }
    };
    run();
  }, []);

  // --- Derived: filtered users
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const s = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
    );
  }, [users, search]);

  // --- Fetch messages when selecting user
  const fetchMessages = async (userId: string, showLoader = true) => {
    try {
      setSelectedUser(userId);
      if (showLoader) setLoadingMsgs(true);
      const res = await axios.get<Message[]>(`/api/message/conversation?userId=${userId}`);
      setMessages(res.data ?? []);
      setError("");
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? e.message ?? "Failed to load conversation.");
    } finally {
      if (showLoader) setLoadingMsgs(false);
    }
  };

  // --- Polling to keep conversation fresh while a user is open
  useEffect(() => {
    if (!selectedUser) return;
    const id = window.setInterval(() => {
      void fetchMessages(selectedUser, false);
    }, 4000);
    return () => window.clearInterval(id);
  }, [selectedUser]);

  // --- Auto-scroll to bottom on message updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // --- Optimistic send
  const sendReply = async () => {
    const content = reply.trim();
    if (!content || !selectedUser || sending) return;

    // optimistic UI
    const optimistic: Message = { senderId: null, content };
    setMessages((m) => [...m, optimistic]);
    setReply("");
    setSending(true);

    try {
      await axios.post("/api/message/send", {
        senderId: null, // admin
        receiverId: selectedUser,
        content,
      });
      await fetchMessages(selectedUser, false);
    } catch (err: unknown) {
      // rollback (remove last optimistic)
      setMessages((m) => m.slice(0, -1));
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? e.message ?? "Failed to send message.");
      setReply(content); // restore text
    } finally {
      setSending(false);
    }
  };

  // --- Keyboard send
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void sendReply();
    }
  };

  // --- Small helper: initials bubble
  const initials = (name?: string, email?: string) => {
    const base = (name || email || "?").trim();
    const parts = base.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return base.slice(0, 2).toUpperCase();
  };

  // --- UI (unchanged from your improved version) ---
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-pink-600 text-center mb-4 md:mb-6">
        Admin – Message Users
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[360px_minmax(0,1fr)] gap-4 md:gap-6">
        {/* Sidebar */}
        <Card className={`${isMobile && selectedUser ? "hidden md:block" : "block"}`}>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by name or email"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-1">
              {loadingUsers ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg border">
                    <div className="h-9 w-9 rounded-full bg-pink-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                ))
              ) : filteredUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No users found.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const active = selectedUser === user._id;
                  return (
                    <button
                      key={user._id}
                      onClick={() => void fetchMessages(user._id)}
                      className={`text-left group p-3 rounded-xl border transition-all ${
                        active ? "border-pink-300 bg-pink-50" : "hover:border-pink-200 hover:bg-pink-50/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex items-center justify-center rounded-full font-semibold text-pink-700 bg-pink-100 ring-1 ring-pink-200">
                          {initials(user.name, user.email)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{user.name || "Unnamed"}</div>
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversation */}
        <Card className={`${isMobile && !selectedUser ? "hidden md:block" : "block"}`}>
          <CardContent className="p-0 flex flex-col h-[70vh] md:h-[75vh]">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b p-3 md:p-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50">
              {isMobile && selectedUser && (
                <Button
                  variant="outline"
                  size="icon"
                  className="border-pink-200 text-pink-600"
                  onClick={() => setSelectedUser(null)}
                  title="Back to users"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 flex items-center justify-center rounded-full font-semibold text-pink-700 bg-pink-100 ring-1 ring-pink-200">
                  {initials(
                    users.find((u) => u._id === selectedUser)?.name,
                    users.find((u) => u._id === selectedUser)?.email
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {selectedUser
                      ? users.find((u) => u._id === selectedUser)?.name || "Select a user"
                      : "Select a user"}
                  </div>
                  {selectedUser && (
                    <div className="text-xs text-muted-foreground truncate">
                      {users.find((u) => u._id === selectedUser)?.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={conversationRef} className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4 bg-gradient-to-b from-white to-pink-50/40">
              {!selectedUser && !loadingMsgs && (
                <div className="h-full grid place-items-center text-center text-muted-foreground">
                  <div>
                    <p className="text-sm md:text-base">Pick a user to view the conversation.</p>
                  </div>
                </div>
              )}

              {selectedUser && loadingMsgs && (
                <div className="space-y-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 ? "justify-start" : "justify-end"}`}>
                      <div className="p-3 rounded-2xl max-w-[80%] animate-pulse bg-gray-200 h-10" />
                    </div>
                  ))}
                </div>
              )}

              {selectedUser && !loadingMsgs && messages.length === 0 && (
                <div className="h-full grid place-items-center text-center text-muted-foreground">
                  <div>
                    <p className="text-sm md:text-base">No messages yet.</p>
                    <p className="text-xs md:text-sm">Start the conversation below.</p>
                  </div>
                </div>
              )}

              {selectedUser && !loadingMsgs && messages.length > 0 && (
                <div className="space-y-2 md:space-y-3">
                  {messages.map((msg, idx) => {
                    const fromUser = msg.senderId === selectedUser;
                    return (
                      <div key={idx} className={`flex ${fromUser ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`px-3 py-2 md:px-4 md:py-2.5 rounded-2xl shadow-sm max-w-[85%] md:max-w-[70%] text-[13px] md:text-sm leading-relaxed
                          ${fromUser ? "bg-gray-100 text-gray-900 rounded-bl-sm" : "bg-pink-100 text-pink-900 rounded-br-sm"}`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t p-3 md:p-4 bg-white">
              <div className="flex gap-2">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={!selectedUser || sending}
                  placeholder={selectedUser ? "Type a reply and press Enter…" : "Select a user to start"}
                  className="flex-1"
                />
                <Button
                  onClick={() => void sendReply()}
                  disabled={!selectedUser || sending || !reply.trim()}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">Send</span>
                </Button>
              </div>

              {error && <p className="mt-2 text-xs text-red-600 text-center">{error}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
