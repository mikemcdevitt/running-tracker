import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

export type Role = "editor" | "viewer";

function parseEmailList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

// Full read/write access.
const EDITOR_EMAILS = parseEmailList(process.env.ALLOWED_EMAILS);
// Read-only access: can view everything, can't create/edit/delete anything.
const VIEWER_EMAILS = parseEmailList(process.env.READONLY_EMAILS);

function roleFor(email: string | null | undefined): Role | null {
  if (!email) return null;
  const normalized = email.toLowerCase();
  if (EDITOR_EMAILS.includes(normalized)) return "editor";
  if (VIEWER_EMAILS.includes(normalized)) return "viewer";
  return null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (EDITOR_EMAILS.length === 0 && VIEWER_EMAILS.length === 0) {
        console.error("ALLOWED_EMAILS/READONLY_EMAILS are not set — denying all sign-ins.");
        return false;
      }
      return roleFor(user.email) !== null;
    },
    async jwt({ token }) {
      token.role = roleFor(token.email) ?? undefined;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as Role | undefined) ?? null;
      }
      return session;
    },
  },
};

/** True if the role has read/write access. */
export function canEdit(role: Role | null | undefined): role is "editor" {
  return role === "editor";
}
