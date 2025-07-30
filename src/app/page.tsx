"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Star, Video, Users, Brush } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  const testimonials = [
    {
      name: "Anjali R.",
      quote:
        "Sutra changed how I see design. The mentors are amazing and the community is supportive!",
    },
    {
      name: "Sagar M.",
      quote:
        "From zero to freelancing designer — all thanks to the structured learning at Sutra!",
    },
    {
      name: "Reema T.",
      quote:
        "Every class is full of energy and real knowledge. Best online learning experience ever.",
    },
    {
      name: "Aarav Shrestha",
      quote:
        "Sutra completely changed the way I think about design. The classes are top-notch!",
    },
    {
      name: "Sneha Joshi",
      quote:
        "Love the mentor interaction! I got personal feedback that really helped me grow.",
    },
    {
      name: "Ramesh Bhandari",
      quote:
        "Very easy to use and beautifully designed platform. Highly recommend to creatives.",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 text-foreground">
      {/* HERO */}
      <section className="flex items-center justify-center px-4 py-16 md:py-24 min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 max-w-3xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-pink-700 dark:text-pink-400 leading-tight tracking-tight">
            Unleash Your Creativity <br className="hidden md:inline" />
            with{" "}
            <span className="text-purple-700 dark:text-purple-300">
              Sutra Designing
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Learn from premium video classes, connect with mentors, and bring
            your designs to life. Sutra is where passion meets precision.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            {!session && (
              <Link href="/register" aria-label="Get Started">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 text-lg rounded-xl shadow-md transition">
                  Get Started
                </Button>
              </Link>
            )}
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
      </section>

      {/* FEATURES */}
      <section className="py-16 px-4 md:px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-pink-600 dark:text-pink-300">
            Why Learn with Sutra?
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {[
              {
                icon: <Video className="w-10 h-10 text-pink-500" />,
                title: "Premium Video Classes",
                desc: "Step-by-step tutorials taught by experienced mentors.",
              },
              {
                icon: <Brush className="w-10 h-10 text-pink-500" />,
                title: "Creative Projects",
                desc: "Build real-world designs to grow your portfolio.",
              },
              {
                icon: <Users className="w-10 h-10 text-pink-500" />,
                title: "Mentorship Access",
                desc: "1-on-1 support and live feedback sessions.",
              },
              {
                icon: <Star className="w-10 h-10 text-pink-500" />,
                title: "Rated 4.9/5",
                desc: "Loved by over 10,000 creative learners worldwide.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center text-center space-y-4 p-4 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-800 transition"
              >
                {item.icon}
                <h3 className="font-semibold text-lg text-pink-700 dark:text-pink-200">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-20 px-4 md:px-6 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-40 h-40 md:w-56 md:h-56 overflow-hidden rounded-full shadow-xl mx-auto md:mx-0"
          >
            {/* Placeholder for founder image */}
            <Image
              src="/founder.jpg"
              alt="Merina Giri"
              width={224}
              height={224}
              className="object-cover w-full h-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 text-center md:text-left"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-300">
              Meet Merina Giri, Founder
            </h2>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Merina Giri founded Sutra from a deep passion for design and
              community. As a self‑taught creative, she faced the challenge of
              limited learning resources in Nepal—which inspired her to build a
              platform for aspiring designers. What started as mentoring a few
              friends has now grown into a thriving academy serving students
              globally.
            </p>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Merina believes that great design comes from fearless creativity
              and meaningful feedback. Her mission is to empower students
              through premium video courses, live mentorship, and a supportive
              design ecosystem. Today, under her leadership, Sutra fosters
              confidence, community, and real results for hundreds of creative
              learners.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS CAROUSEL */}
      <section className="py-20 bg-pink-50 dark:bg-gray-800 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-pink-600 dark:text-pink-300">
            What Our Students Say
          </h2>

          <div className="relative h-40 sm:h-36 max-w-xl mx-auto px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex flex-col justify-center bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-8"
              >
                <p className="text-base sm:text-lg italic text-gray-700 dark:text-gray-300 leading-relaxed">
                  “{testimonials[current].quote}”
                </p>
                <p className="mt-4 text-sm sm:text-base text-pink-700 dark:text-pink-300 font-semibold">
                  – {testimonials[current].name}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition ${
                  i === current
                    ? "bg-pink-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
