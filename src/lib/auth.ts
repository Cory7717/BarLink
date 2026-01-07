import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type TokenShape = {
  id?: string;
  role?: string;
};

type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const owner = await prisma.owner.findUnique({
          where: { email: credentials.email as string },
          include: { subscription: true },
        });

        if (!owner || !owner.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          owner.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: owner.id,
          email: owner.email,
          name: owner.name,
          role: "owner",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      const nextToken = token as TokenShape;
      if (user) {
        nextToken.id = user.id;
        nextToken.role = (user as SessionUser).role || "patron";
      }
      return nextToken;
    },
    async session({ session, token }) {
      const nextToken = token as TokenShape;
      if (session.user) {
        const u = session.user as SessionUser;
        u.id = typeof nextToken.id === "string" ? nextToken.id : undefined;
        u.role = typeof nextToken.role === "string" ? nextToken.role : "patron";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);

// Helper function for getting session in server components/routes
export async function auth() {
  const { getServerSession } = await import("next-auth/next");
  return getServerSession(authOptions);
}
