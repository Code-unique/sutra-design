import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error("No user found");

        const isMatch = await bcrypt.compare(credentials!.password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          isPremium: user.isPremium,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.isAdmin = token.isAdmin;
      session.user.isPremium = token.isPremium;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
        token.isPremium = user.isPremium;
        token.sub = user.id;

      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
