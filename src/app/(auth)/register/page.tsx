"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MailIcon, LockIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface FormState {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

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
      await axios.post("/api/register", form);
      router.push("/login");
    } catch (error) {
      // Use AxiosError type guard
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Registration failed.");
      } else {
        setError("Registration failed.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-3xl font-bold text-center text-pink-700">
            Join Sutra Designing
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-2.5 top-3 h-5 w-5 text-pink-500" />
              <Input
                className="pl-10"
                placeholder="Name"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="relative">
              <MailIcon className="absolute left-2.5 top-3 h-5 w-5 text-pink-500" />
              <Input
                className="pl-10"
                placeholder="Email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <LockIcon className="absolute left-2.5 top-3 h-5 w-5 text-pink-500" />
              <Input
                type="password"
                className="pl-10"
                placeholder="Password"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button
              onClick={handleSubmit}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold"
            >
              Register
            </Button>
          </div>

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
    </div>
  );
}
