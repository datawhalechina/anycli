"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileCard({
  user,
}: {
  user: { name: string | null; bio: string | null; email: string; handle: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
    });
    setPending(false);
    if (res.ok) {
      setStatus("已保存");
      router.refresh();
    } else {
      setStatus("保存失败");
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">资料</h2>
      <p className="mt-1 font-mono text-xs text-[var(--muted)]">
        @{user.handle} · {user.email}
      </p>
      <form onSubmit={onSave} className="mt-6 flex flex-col gap-4">
        <label className="text-sm font-medium text-[var(--foreground)]">
          显示名称
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>
        <label className="text-sm font-medium text-[var(--foreground)]">
          简介
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-1.5 w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "保存中…" : "保存"}
          </button>
          {status ? <span className="text-sm text-[var(--muted)]">{status}</span> : null}
        </div>
      </form>
    </section>
  );
}

