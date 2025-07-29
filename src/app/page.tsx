'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6 text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 max-w-2xl"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-pink-700 dark:text-pink-400 leading-tight tracking-tight">
          Unleash Your Creativity <br className="hidden md:inline" />
          with <span className="text-purple-700 dark:text-purple-300">Sutra Designing</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground dark:text-gray-300">
          Learn from premium video classes, connect with mentors, and bring your designs to life.
          Sutra is where passion meets precision.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link href="/register" aria-label="Get Started">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 text-lg rounded-xl shadow-md transition">
              Get Started
            </Button>
          </Link>
          <Link href="/dashboard" aria-label="Explore Classes">
            <Button
              variant="outline"
              className="text-pink-600 border-pink-500 hover:bg-pink-100 dark:hover:bg-gray-700 px-6 py-3 text-lg rounded-xl transition"
            >
              Explore Classes
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
