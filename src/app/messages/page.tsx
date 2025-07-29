"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type MessageType = {
  senderId: string;
  receiverId: string | null;
  content: string;
  createdAt?: string;
};

export default function MessagePage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    try {
      const res = await axios.get("/api/message/user-messages", { withCredentials: true });
      setMessages(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Fetch messages axios error:", err.response);
      } else {
        console.error("Fetch messages unknown error:", err);
      }
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchMessages();
      setError("");
    } else if (status === "unauthenticated") {
      setError("You must be logged in to send and view messages.");
      setMessages([]);
    }
  }, [status]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(
        "/api/message/send",
        { content: newMessage, receiverId: null },
        { withCredentials: true }
      );
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Send message axios error:", err.response);
      } else {
        console.error("Send message unknown error:", err);
      }
    }
  };

  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center text-pink-600">Message Admin</h1>

      {error && (
        <p className="text-center text-red-600 font-semibold">{error}</p>
      )}

      <Card>
        <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.senderId === session?.user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 px-3 rounded-lg text-sm ${
                  msg.senderId === session?.user?.id
                    ? "bg-pink-100 text-right"
                    : "bg-gray-200"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {messages.length === 0 && status === "authenticated" && (
            <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
          )}
        </CardContent>
      </Card>

      {/* Show input and button only if authenticated */}
      {status === "authenticated" && (
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <Button
            onClick={sendMessage}
            className="bg-pink-600 hover:bg-pink-700"
          >
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
