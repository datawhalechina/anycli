"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { useState } from "react";
import { UserMenu } from "@/components/UserMenu";
import type { Lang } from "@/i18n/messages";
import { LANG_COOKIE, t } from "@/i18n/messages";

export function Header({ lang = "zh" }: { lang?: Lang }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const publishActive = pathname?.startsWith("/publish");

  const setLang = (next: Lang) => {
    document.cookie = `${LANG_COOKIE}=${next}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_82%,transparent)] shadow-[0_1px_0_0_var(--accent)]/10 backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--surface)_68%,transparent)]">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6 sm:py-0">
        <Link
          href="/"
          className="group flex items-center gap-3 font-semibold tracking-tight text-[var(--foreground)] transition hover:opacity-90"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] ring-1 ring-[var(--border)] shadow-sm backdrop-blur-md sm:h-14 sm:w-14">
            <Image
              src="/logo.png"
              alt="AnyCLI"
              width={128}
              height={128}
              className="h-10 w-10 object-contain drop-shadow-[0_10px_18px_color-mix(in_srgb,var(--accent)_18%,transparent)] sm:h-11 sm:w-11"
              sizes="(max-width: 640px) 44px, 48px"
              priority
            />
          </span>
          <span className="hidden sm:inline">
            Any<span className="text-[var(--accent)]">CLI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/clis"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/clis" || pathname?.startsWith("/clis/")
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-[var(--elevated)] hover:text-[var(--foreground)]"
            }`}
          >
            {t(lang, "nav.explore")}
          </Link>
          <Link
            href={session ? "/publish" : "/login?callbackUrl=/publish"}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              publishActive
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-[var(--elevated)] hover:text-[var(--foreground)]"
            }`}
          >
            {t(lang, "nav.publish")}
          </Link>
          <Link
            href="/docs"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/docs" || pathname?.startsWith("/docs/")
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-[var(--elevated)] hover:text-[var(--foreground)]"
            }`}
          >
            {t(lang, "nav.docs")}
          </Link>
          <Link
            href="/about"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/about" || pathname?.startsWith("/about/")
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-[var(--elevated)] hover:text-[var(--foreground)]"
            }`}
          >
            {t(lang, "nav.about")}
          </Link>
          <label className="ml-2 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-medium text-[var(--muted)] shadow-sm">
            <span className="sr-only">Language</span>
            <select
              value={lang}
              onChange={(e) => setLang((e.target.value === "en" ? "en" : "zh") as Lang)}
              className="cursor-pointer bg-transparent text-sm font-medium text-[var(--muted)] outline-none"
              aria-label="语言"
            >
              <option value="zh">{t(lang, "lang.zh")}</option>
              <option value="en">{t(lang, "lang.en")}</option>
            </select>
          </label>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <span className="text-sm text-[var(--muted)]">…</span>
          ) : session ? (
            <UserMenu lang={lang} />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--elevated)]"
              >
                {t(lang, "auth.signIn")}
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                {t(lang, "auth.signUp")}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-[var(--foreground)] md:hidden"
          aria-label={t(lang, "header.menu")}
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/clis" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
              {t(lang, "nav.explore")}
            </Link>
            <Link href={session ? "/publish" : "/login?callbackUrl=/publish"} className="rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
              {t(lang, "nav.publish")}
            </Link>
            <Link href="/docs" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
              {t(lang, "nav.docs")}
            </Link>
            <Link href="/about" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
              {t(lang, "nav.about")}
            </Link>
            <label className="mt-1 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_92%,transparent)] px-3 py-2 text-sm font-medium text-[var(--muted)]">
              <span>{t(lang, "header.language")}</span>
              <select
                value={lang}
                onChange={(e) => setLang((e.target.value === "en" ? "en" : "zh") as Lang)}
                className="cursor-pointer bg-transparent text-sm font-medium text-[var(--muted)] outline-none"
                aria-label={t(lang, "header.language")}
              >
                <option value="zh">{t(lang, "lang.zh")}</option>
                <option value="en">{t(lang, "lang.en")}</option>
              </select>
            </label>
            {session ? (
              <>
                <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                  {t(lang, "menu.dashboard")}
                </Link>
                {session.user.isAdmin ? (
                  <Link href="/admin/review" className="rounded-lg px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                    {t(lang, "menu.adminReview")}
                  </Link>
                ) : null}
                <Link href="/settings" className="rounded-lg px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                  {t(lang, "menu.settings")}
                </Link>
                <Link
                  href={`/u/${session.user.handle ?? "me"}`}
                  className="rounded-lg px-3 py-2 text-sm"
                  onClick={() => setOpen(false)}
                >
                  {t(lang, "menu.profile")}
                </Link>
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-left text-sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  {t(lang, "menu.signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login?callbackUrl=/publish"
                  className="rounded-lg px-3 py-2 text-sm font-medium"
                  onClick={() => setOpen(false)}
                >
                  {t(lang, "nav.publish")}
                </Link>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                  {t(lang, "auth.signIn")}
                </Link>
                <Link href="/register" className="rounded-lg px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                  {t(lang, "auth.signUp")}
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
