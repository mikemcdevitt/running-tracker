"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { canEdit } from "@/lib/auth";

/**
 * Guard for pages any signed-in user may view (list/detail pages).
 * Redirects unauthenticated visitors to sign-in. Returns whether the
 * current user is allowed to edit, for pages that render read-only for
 * viewers instead of blocking them outright.
 */
export function useRequireSession() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/api/auth/signin");
  }, [status, router]);

  return { session, status, editable: canEdit(session?.user?.role) };
}

/**
 * Guard for editor-only pages (add/create forms). Redirects unauthenticated
 * visitors to sign-in, and signed-in non-editors to `fallback`.
 */
export function useRequireEditor(fallback: string) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/api/auth/signin");
    else if (status === "authenticated" && !canEdit(session?.user?.role)) router.push(fallback);
  }, [status, session, router, fallback]);

  return { session, status, ready: status === "authenticated" && canEdit(session?.user?.role) };
}
