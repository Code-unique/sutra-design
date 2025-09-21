"use client";

import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Loader2, User, Shield, Crown } from "lucide-react";

interface UserProfile {
  _id: string;
  name?: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get<UserProfile>("/api/users/profile");
        setUser(res.data);
        setForm({ name: res.data.name ?? "", email: res.data.email, password: "" });
      } catch (err: unknown) {
        const e = err as AxiosError<{ message?: string }>;
        setMessage(e.response?.data?.message ?? e.message ?? "Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") void fetchProfile();
  }, [status]);

  const updateProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.put<UserProfile>("/api/users/profile", form);
      setUser(res.data);
      setMessage("Profile updated successfully.");
      setEditMode(false);
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      setMessage(e.response?.data?.message ?? e.message ?? "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-pink-600 w-8 h-8" />
      </div>
    );
  }

  if (!session) {
    return (
      <p className="text-center mt-10 text-red-500 font-semibold">
        Please login to view your profile.
      </p>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6 space-y-6"
    >
      <h1 className="text-3xl font-bold text-pink-600 text-center flex items-center justify-center gap-2">
        <User className="w-7 h-7 text-pink-500" /> My Profile
      </h1>

      {message && <p className="text-center text-sm text-red-500">{message}</p>}

      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{user.name || "Unnamed User"}</h2>
            <div className="flex gap-2">
              {user.isPremium && (
                <Badge className="bg-yellow-500 text-white flex gap-1 items-center">
                  <Crown className="w-4 h-4" /> Premium
                </Badge>
              )}
              {user.isAdmin && (
                <Badge className="bg-blue-600 text-white flex gap-1 items-center">
                  <Shield className="w-4 h-4" /> Admin
                </Badge>
              )}
            </div>
          </div>

          <p className="text-gray-600">{user.email}</p>

          <div className="text-sm text-gray-500">
            <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
            <p>Last Updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
          </div>

          {/* Edit form */}
          {editMode ? (
            <div className="space-y-3">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
              />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
              />
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="New Password (optional)"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => void updateProfile()}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditMode(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              className="bg-pink-600 hover:bg-pink-700 w-full"
            >
              Edit Profile
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
