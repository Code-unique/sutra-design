"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const [apps, setApps] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchApps = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const res = await axios.get<Application[]>(`/api/applications?email=${encodeURIComponent(session.user.email)}`);
      setApps(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch applications", err);
      setError("Could not fetch applications.");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  const approve = async (email: string) => {
    try {
      await axios.put("/api/users/approve", { email });
      fetchApps();
    } catch (error) {
      console.error("Failed to approve application", error);
      setError("Approval failed.");
    }
  };

  useEffect(() => {
    if (session?.user?.email) fetchApps();
  }, [fetchApps, session?.user?.email]);

  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!session || session?.user?.role !== "admin") {
    return <p className="text-center mt-10 text-red-500">Unauthorized – Admins only.</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-pink-600 text-center">Premium Applications</h1>

      {error && <p className="text-center text-red-500">{error}</p>}

      {loading ? (
        <p className="text-center">Loading applications...</p>
      ) : apps.length === 0 ? (
        <p className="text-center text-muted-foreground">No applications found.</p>
      ) : (
        apps.map((app) => (
          <Card key={app._id}>
            <CardContent className="p-4 space-y-2">
              <h2 className="font-semibold">
                {app.name} ({app.email}) - {app.phone}
              </h2>
              <p className="text-sm text-muted-foreground">{app.message}</p>
              <Button
                onClick={() => approve(app.email)}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Approve Premium Access
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
