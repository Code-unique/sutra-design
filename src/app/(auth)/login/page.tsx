"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MailIcon, LockIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError(res?.error || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl rounded-2xl border border-pink-200 bg-white">
          <CardContent className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-center text-pink-600">
              Welcome Back!
            </h1>
            <p className="text-center text-sm text-gray-500">
              Sign in to access your account and continue learning.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div className="relative">
                <MailIcon className="absolute left-3 top-3.5 h-5 w-5 text-pink-500" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <LockIcon className="absolute left-3 top-3.5 h-5 w-5 text-pink-500" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {/* Register link */}
            <p className="text-center text-sm text-gray-500">
              Don’t have an account?{" "}
              <span
                onClick={() => router.push("/register")}
                className="text-pink-600 hover:underline cursor-pointer"
              >
                Register here
              </span>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
