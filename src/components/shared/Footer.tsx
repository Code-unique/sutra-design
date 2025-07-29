"use client";

import Link from "next/link";
import { Facebook, Instagram, Video } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-pink-600 text-pink-100 mt-16 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
        <p className="text-center md:text-left">
          © {new Date().getFullYear()} Sutra Designing. All rights reserved.
        </p>

        <nav className="flex flex-wrap gap-6 items-center text-pink-200 hover:text-pink-300 font-medium">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/dashboard" className="hover:underline">
            Classes
          </Link>
          <Link href="/register" className="hover:underline">
            Register
          </Link>
          <Link href="/login" className="hover:underline">
            Login
          </Link>

          <a
            href="https://www.tiktok.com/@sutradesignacademy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
            aria-label="TikTok"
          >
            <Video className="w-4 h-4" />
            TikTok
          </a>

          <a
            href="https://www.facebook.com/people/Sutra-by-Merina/61575802003659/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
            aria-label="Facebook"
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </a>

          <a
            href="https://www.instagram.com/sutradesignacademy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  );
}
