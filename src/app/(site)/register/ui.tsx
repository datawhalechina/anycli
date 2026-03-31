"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GitHubSignInButton } from "@/components/GitHubSignInButton";
import { t, type Lang } from "@/i18n/messages";

export function RegisterForm({ githubConfigured, lang }: { githubConfigured: boolean; lang: Lang }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        handle,
        name: name || undefined,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setPending(false);
      setError(data.error ?? t(lang, "auth.register.failed"));
      return;
    }
    const sign = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setPending(false);
    if (sign?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <GitHubSignInButton
        callbackUrl="/dashboard"
        label={t(lang, "auth.register.github")}
        configured={githubConfigured}
      />
      <p className="text-center text-xs text-[var(--muted)]">{t(lang, "auth.register.orEmail")}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {t(lang, "auth.register.handle")}
          <input
            type="text"
            required
            pattern="^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$"
            minLength={2}
            maxLength={32}
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase())}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {t(lang, "auth.register.name")}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {t(lang, "auth.email")}
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          {t(lang, "auth.register.password")}
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t(lang, "auth.register.pending") : t(lang, "auth.register.submit")}
        </button>
      </form>
    </div>
  );
}
