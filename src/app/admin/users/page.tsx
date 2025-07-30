"use client";

import { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminUser {
  _id: string;
  name?: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// narrow the session user shape we rely on
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

  if (status === "loading") return <p className="text-center mt-10">Loading...</p>;
  if (!session || role !== "admin") {
    return <p className="text-center mt-10 text-red-500">Unauthorized – Admins only.</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-pink-600 text-center">Users</h1>

      {error && <p className="text-center text-red-500">{error}</p>}

      {loading ? (
        <p className="text-center">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-muted-foreground">No users found.</p>
      ) : (
        users.map((u) => (
          <Card key={u._id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {u.name || "Unnamed"} <span className="text-muted-foreground">({u.email})</span>
                  </h2>
                  <div className="mt-1 flex gap-2">
                    <Badge variant={u.isPremium ? "default" : "secondary"}>
                      {u.isPremium ? "Premium" : "Free"}
                    </Badge>
                    <Badge variant={u.isAdmin ? "default" : "secondary"}>
                      {u.isAdmin ? "Admin" : "User"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => void togglePremium(u)}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    {u.isPremium ? "Remove Premium" : "Make Premium"}
                  </Button>

                  <Button
                    onClick={() => void toggleAdmin(u)}
                    variant="outline"
                    className="border-pink-600 text-pink-600 hover:bg-pink-50"
                    disabled={selfId === u._id && u.isAdmin}
                    title={selfId === u._id && u.isAdmin ? "You cannot remove your own admin role" : "Toggle admin"}
                  >
                    {u.isAdmin ? "Remove Admin" : "Make Admin"}
                  </Button>

                  <Button
                    onClick={() => void deleteUser(u)}
                    className="bg-red-600 hover:bg-red-700"
                    variant="default"
                    disabled={selfId === u._id}
                    title={selfId === u._id ? "You cannot delete yourself" : "Delete user"}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
