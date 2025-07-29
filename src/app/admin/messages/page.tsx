"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    fetchMessagedUsers();
  }, []);

  const fetchMessagedUsers = async () => {
    const res = await axios.get<User[]>("/api/message/messaged-users");
    setUsers(res.data);
  };

  const fetchMessages = async (userId: string) => {
    setSelectedUser(userId);
    const res = await axios.get<Message[]>(`/api/message/conversation?userId=${userId}`);
    setMessages(res.data);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedUser) return;

    await axios.post("/api/message/send", {
      senderId: null, // admin
      receiverId: selectedUser,
      content: reply,
    });

    setReply("");
    fetchMessages(selectedUser);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-pink-600 text-center mb-6">Admin – Message Users</h1>

      <div className="flex gap-6">
        <div className="w-1/3 space-y-2">
          <h2 className="font-semibold">Users</h2>
          {users.length === 0 ? (
            <p className="text-muted-foreground">No messages yet.</p>
          ) : (
            users.map((user) => (
              <Card
                key={user._id}
                className={`p-3 cursor-pointer ${selectedUser === user._id ? "bg-pink-100" : ""}`}
                onClick={() => fetchMessages(user._id)}
              >
                {user.name} ({user.email})
              </Card>
            ))
          )}
        </div>

        <div className="flex-1 space-y-4">
          <h2 className="font-semibold">Conversation</h2>
          <Card className="max-h-[400px] overflow-y-auto">
            <CardContent className="p-4 space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.senderId === selectedUser ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`p-2 px-3 rounded-lg text-sm ${
                      msg.senderId === selectedUser ? "bg-gray-200" : "bg-pink-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {selectedUser && (
            <div className="flex gap-2">
              <Input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a reply..."
              />
              <Button onClick={sendReply} className="bg-pink-600 hover:bg-pink-700">
                Send
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
