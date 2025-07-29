"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import confetti from "canvas-confetti";

export default function ApplyPremiumPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!form.name || !form.email || !form.phone || !form.message) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      await axios.post("/api/applications", form);
      setSubmitted(true);
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error("Submission error:", err);
      setError("Submission failed. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-bold text-center text-pink-600">
            Apply for Premium Access
          </h1>

          {submitted ? (
            <p className="text-green-600 text-center font-medium">
              🎉 Request submitted! Our team will review it soon.
            </p>
          ) : (
            <>
              <Input
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Your Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Your Phone Number"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Textarea
                placeholder="Why do you want access to premium classes?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                onClick={handleSubmit}
                className="bg-pink-600 hover:bg-pink-700 w-full"
              >
                Submit Request
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
