"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, useCallback } from "react";
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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Make fetchMessages stable so it can be used in effect deps
  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get<MessageType[]>("/api/message/user-messages", {
        withCredentials: true,
      });
      setMessages(res.data);
      setError("");
      // Scroll after render
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Fetch messages axios error:", err.response);
        setError("Failed to load messages. Please try again later.");
      } else {
        console.error("Fetch messages unknown error:", err);
        setError("An unexpected error occurred.");
      }
    }
  }, []); // no deps used inside

  useEffect(() => {
    if (status === "authenticated") {
      void fetchMessages();
    } else if (status === "unauthenticated") {
      setError("You must be logged in to send and view messages.");
      setMessages([]);
    }
  }, [status, fetchMessages]); // include fetchMessages

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(
        "/api/message/send",
        { content: newMessage, receiverId: null },
        { withCredentials: true }
      );
      setNewMessage("");
      void fetchMessages();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Send message axios error:", err.response);
        setError("Failed to send message. Please try again.");
      } else {
        console.error("Send message unknown error:", err);
        setError("An unexpected error occurred.");
      }
    }
  };

  if (status === "loading") {
    return (
      <p className="text-center mt-10 text-pink-600 font-semibold">
        Loading messages...
      </p>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-pink-600">
        Message Admin
      </h1>

      {error && (
        <p className="text-center text-red-600 font-semibold">{error}</p>
      )}

      <Card className="max-h-[500px] overflow-hidden flex flex-col">
        <CardContent className="p-4 overflow-y-auto flex-1 space-y-4">
          {messages.length === 0 && status === "authenticated" ? (
            <p className="text-center text-gray-500 mt-10">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.senderId === session?.user?.id;
              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] break-words p-3 rounded-lg text-sm ${
                      isUser
                        ? "bg-pink-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                    title={
                      msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString()
                        : undefined
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {status === "authenticated" && (
        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            className="flex-1"
            aria-label="Type your message"
          />
          <Button
            onClick={sendMessage}
            className="bg-pink-600 hover:bg-pink-700"
            aria-label="Send message"
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
