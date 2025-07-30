"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MailIcon, LockIcon, UserIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

interface FormState {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/register", form);
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Registration failed.");
      } else {
        setError("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl rounded-2xl border border-pink-200 bg-white">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-bold text-center text-pink-700">
              Create an Account
            </h2>
            <p className="text-center text-sm text-gray-500">
              Join Sutra and unleash your creativity with our premium classes.
            </p>

            <div className="space-y-5">
              {/* Name */}
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-pink-500" />
                <Input
                  className="pl-10"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <MailIcon className="absolute left-3 top-3.5 h-5 w-5 text-pink-500" />
                <Input
                  className="pl-10"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <LockIcon className="absolute left-3 top-3.5 h-5 w-5 text-pink-500" />
                <Input
                  type="password"
                  className="pl-10"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                onClick={handleSubmit}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Register"
                )}
              </Button>
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                className="text-pink-600 hover:underline cursor-pointer"
              >
                Login here
              </span>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
