import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

// Only this Google account may sign in. Fails closed: if ALLOWED_EMAIL
// isn't set, no one can sign in rather than accidentally allowing anyone
// with a Google account.
const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL?.toLowerCase();

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!ALLOWED_EMAIL) {
        console.error("ALLOWED_EMAIL is not set — denying all sign-ins.");
        return false;
      }
      return user.email?.toLowerCase() === ALLOWED_EMAIL;
    },
  },
};
