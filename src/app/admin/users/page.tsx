"use client";

import { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";

interface AdminUser {
  _id: string;
  name?: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

type SessionUserLite = {
  id?: string;
  role?: "admin" | "user";
  isPremium?: boolean;
  isAdmin?: boolean;
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const sessUser = (session?.user as SessionUserLite | undefined) ?? undefined;
  const role = sessUser?.role;
  const selfId = sessUser?.id;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<AdminUser[]>("/api/admin/users");
      setUsers(res.data);
      setError("");
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? e.message ?? "Could not fetch users.");
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePremium = async (u: AdminUser) => {
    try {
      await axios.patch(`/api/admin/users/${u._id}`, { isPremium: !u.isPremium });
      await fetchUsers();
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? e.message ?? "Failed to update premium status.");
    }
  };

  const toggleAdmin = async (u: AdminUser) => {
    try {
      await axios.patch(`/api/admin/users/${u._id}`, { isAdmin: !u.isAdmin });
      await fetchUsers();
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? e.message ?? "Failed to update admin status.");
    }
  };

  const deleteUser = async (u: AdminUser) => {
    if (selfId === u._id) {
      setError("You cannot delete your own account.");
      return;
    }
    const ok = window.confirm(`Delete user "${u.email}"? This cannot be undone.`);
    if (!ok) return;

    try {
      await axios.delete(`/api/admin/users/${u._id}`);
      await fetchUsers();
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>;
      setError(e.response?.data?.message ?? e.message ?? "Failed to delete user.");
    }
  };

  useEffect(() => {
    if (status === "authenticated") void fetchUsers();
  }, [status, fetchUsers]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-pink-600 w-8 h-8" />
      </div>
    );
  }

  if (!session || role !== "admin") {
    return (
      <p className="text-center mt-10 text-red-500 font-semibold">
        Unauthorized – Admins only.
      </p>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-pink-600 text-center flex items-center justify-center gap-2">
        <Users className="w-6 h-6 text-pink-500" /> Users Management
      </h1>

      {error && <p className="text-center text-red-500">{error}</p>}

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="h-20 bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-muted-foreground">No users found.</p>
      ) : (
        users.map((u) => (
          <motion.div
            key={u._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-4 space-y-3">
                {/* User info */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg break-words">
                      {u.name || "Unnamed"}
                      <span className="block md:inline md:ml-2 text-sm text-muted-foreground">
                        ({u.email})
                      </span>
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={u.isPremium ? "default" : "secondary"}>
                        {u.isPremium ? "Premium" : "Free"}
                      </Badge>
                      <Badge variant={u.isAdmin ? "default" : "secondary"}>
                        {u.isAdmin ? "Admin" : "User"}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button
                      onClick={() => void togglePremium(u)}
                      className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto"
                    >
                      {u.isPremium ? "Remove Premium" : "Make Premium"}
                    </Button>

                    <Button
                      onClick={() => void toggleAdmin(u)}
                      variant="outline"
                      className="border-pink-600 text-pink-600 hover:bg-pink-50 w-full sm:w-auto"
                      disabled={selfId === u._id && u.isAdmin}
                      title={
                        selfId === u._id && u.isAdmin
                          ? "You cannot remove your own admin role"
                          : "Toggle admin"
                      }
                    >
                      {u.isAdmin ? "Remove Admin" : "Make Admin"}
                    </Button>

                    <Button
                      onClick={() => void deleteUser(u)}
                      className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                      disabled={selfId === u._id}
                      title={
                        selfId === u._id
                          ? "You cannot delete yourself"
                          : "Delete user"
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}
