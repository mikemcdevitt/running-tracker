import Link from "next/link";
import type { ReactNode } from "react";

/** Page-level wrapper: full-height background plus a centered, max-width column. */
export function PageShell({
  maxWidth = "max-w-2xl",
  compactOnMobile = false,
  children,
}: {
  maxWidth?: string;
  compactOnMobile?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-black ${compactOnMobile ? "px-0 py-0 sm:px-4 sm:py-12" : "px-4 py-12"}`}>
      <div className={`mx-auto ${maxWidth}`}>{children}</div>
    </div>
  );
}

/** Title + optional subtitle on the left, action buttons/links on the right. */
export function PageHeader({
  title,
  subtitle,
  actions,
  className = "mb-8",
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
        {subtitle}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}

const pillBase = "rounded-full px-4 py-2 text-sm font-medium transition-colors";
const pillVariants = {
  ghost:
    "border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900",
  solid: "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900",
} as const;

/** Rounded pill nav link, used for both primary actions ("+ Log run") and secondary nav ("Home", "EV log"). */
export function PillLink({
  href,
  variant = "ghost",
  children,
}: {
  href: string;
  variant?: keyof typeof pillVariants;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${pillBase} ${pillVariants[variant]}`}>
      {children}
    </Link>
  );
}

/** Understated "back to list" link under a form. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <div className="mt-4 text-center px-5 sm:px-0">
      <a href={href} className="text-sm text-zinc-400 hover:text-zinc-600">
        {children}
      </a>
    </div>
  );
}
