"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-pink-600">
          Sutra
        </Link>
        <button onClick={toggle} className="md:hidden text-pink-600">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <ul
          className={`md:flex md:gap-6 items-center absolute md:static bg-white md:bg-transparent left-0 w-full md:w-auto px-4 py-4 md:py-0 md:px-0 transition-all duration-300 ${
            isOpen ? "top-[60px]" : "-top-[500px]"
          } md:top-0`}
        >
          <li>
            <Link href="/" className="block py-2 px-4 hover:text-pink-500">
              Home
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="block py-2 px-4 hover:text-pink-500">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/profile" className="block py-2 px-4 hover:text-pink-500">
              profile
            </Link>
          </li>

    

          {isAdmin && (
            <>
              <li>
                <Link href="/admin" className="block py-2 px-4 hover:text-pink-500">
                  Admin
                </Link>
              </li>
              
              <li>
      <Link href="/admin/users" className="block py-2 px-4 hover:text-pink-500">
        Users
      </Link>
    </li>
          
              
            </>
          )}

          {!session && (
            <>
              <li>
                <Link href="/login" className="block py-2 px-4 hover:text-pink-500">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="block py-2 px-4 hover:text-pink-500">
                  Register
                </Link>
              </li>
            </>
          )}

          {session && (
            <li className="block py-2 px-4">
              <Button
                onClick={() => signOut()}
                className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white"
              >
                Logout
              </Button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
