import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: Role | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}
