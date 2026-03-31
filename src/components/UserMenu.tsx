"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/i18n/messages";

export function UserMenu({ lang = "zh" }: { lang?: Lang }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(ev: MouseEvent) {
      if (ref.current?.contains(ev.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!session?.user) return null;

  const label = session.user.name ?? session.user.email ?? t(lang, "user.default");
  const initial = label.charAt(0).toUpperCase();
  const handle = session.user.handle;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-1.5 pr-2 text-left text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-[var(--elevated)]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="h-7 w-7 rounded-lg object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
            {initial}
          </span>
        )}
        <span className="max-w-[8rem] truncate hidden sm:inline">{label}</span>
        <ChevronDown className={`h-4 w-4 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[12rem] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
        >
          <Link
            role="menuitem"
            href="/dashboard"
            className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--elevated)]"
            onClick={() => setOpen(false)}
          >
            {t(lang, "menu.dashboard")}
          </Link>
          {session.user.isAdmin ? (
            <Link
              role="menuitem"
              href="/admin/review"
              className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--elevated)]"
              onClick={() => setOpen(false)}
            >
              {t(lang, "menu.adminReview")}
            </Link>
          ) : null}
          <Link
            role="menuitem"
            href="/settings"
            className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--elevated)]"
            onClick={() => setOpen(false)}
          >
            {t(lang, "menu.settings")}
          </Link>
          <Link
            role="menuitem"
            href={`/u/${handle}`}
            className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--elevated)]"
            onClick={() => setOpen(false)}
          >
            {t(lang, "menu.profile")} @{handle}
          </Link>
          <div className="my-1 h-px bg-[var(--border)]" />
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-2.5 text-left text-sm text-[var(--muted)] hover:bg-[var(--elevated)] hover:text-[var(--foreground)]"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            {t(lang, "menu.signOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
