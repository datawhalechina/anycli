"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { GitHubSignInButton } from "@/components/GitHubSignInButton";
import { t, type Lang } from "@/i18n/messages";

export function LoginForm({
  callbackUrl,
  githubConfigured,
  lang,
}: {
  callbackUrl: string;
  /** 已配置 Client ID + Secret 时可点击；未配置仍显示按钮（禁用+说明） */
  githubConfigured: boolean;
  lang: Lang;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl,
    });
    setPending(false);
    if (res?.error) {
      setError(
        githubConfigured
          ? t(lang, "auth.login.error.githubHint")
          : t(lang, "auth.login.error.basic"),
      );
      return;
    }
    window.location.href = callbackUrl;
  }

  return (
    <div className="flex flex-col gap-4">
      <GitHubSignInButton
        callbackUrl={callbackUrl}
        label={t(lang, "auth.login.github")}
        configured={githubConfigured}
      />
      <p className="text-center text-xs text-[var(--muted)]">{t(lang, "auth.or")}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {t(lang, "auth.email")}
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none ring-[var(--accent)]/0 focus:ring-4"
          />
        </label>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {t(lang, "auth.password")}
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none ring-[var(--accent)]/0 focus:ring-4"
          />
        </label>
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t(lang, "auth.login.pending") : t(lang, "auth.login.email")}
        </button>
      </form>
    </div>
  );
}
