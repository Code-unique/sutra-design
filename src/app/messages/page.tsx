"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, MessageSquare } from "lucide-react";
import Image from "next/image";

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
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get<MessageType[]>("/api/message/user-messages", {
        withCredentials: true,
      });
      setMessages(res.data);
      setError("");
      setTimeout(scrollToBottom, 200);
    } catch (err) {
      setError("Failed to load messages. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      void fetchMessages();
    } else if (status === "unauthenticated") {
      setError("You must be logged in to send and view messages.");
      setMessages([]);
    }
  }, [status, fetchMessages]);

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
    } catch {
      setError("Failed to send message. Please try again.");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-pink-600 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto flex flex-col gap-6 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center text-pink-600">
        Message Admin
      </h1>

      {error && (
        <p className="text-center text-red-600 font-semibold">{error}</p>
      )}

      <Card className="flex flex-col border shadow-md rounded-xl flex-grow">
        <CardContent className="p-4 overflow-y-auto flex-1 space-y-4 bg-pink-50 dark:bg-gray-800">
          {loading ? (
            [...Array(4)].map((_, idx) => (
              <div key={idx} className="w-2/3 h-5 bg-gray-300 animate-pulse rounded-md" />
            ))
          ) : messages.length === 0 && status === "authenticated" ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-16">
              <MessageSquare className="w-12 h-12 text-pink-400 mb-4" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.senderId === session?.user?.id;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] break-words p-3 rounded-2xl text-sm shadow-md relative ${
                      isUser
                        ? "bg-pink-600 text-white rounded-br-none"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                    }`}
                    title={
                      msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString()
                        : undefined
                    }
                  >
                    {msg.content}
                    <span className="block text-[10px] mt-1 opacity-70">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString()
                        : ""}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {status === "authenticated" && (
        <div className="flex gap-2 sticky bottom-2 bg-white dark:bg-gray-900 p-2 rounded-xl shadow-lg">
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
            className="flex-1 rounded-full px-4"
          />
          <Button
            onClick={sendMessage}
            className="bg-pink-600 hover:bg-pink-700 px-6 rounded-full"
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
