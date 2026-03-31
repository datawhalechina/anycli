"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type FeaturedCard = {
  slug: string;
  name: string;
  description: string;
  verified: boolean;
  ownerHandle: string;
  githubStars: number;
  installCommand: string | null;
};

function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Props = {
  cards: FeaturedCard[];
  pageSize?: number;
  intervalMs?: number;
  fadeMs?: number;
};

export function FeaturedRotatingGrid({
  cards,
  pageSize = 6,
  intervalMs = 5200,
  fadeMs = 220,
}: Props) {
  const pages = useMemo(() => chunk(cards, pageSize).filter((p) => p.length > 0), [cards, pageSize]);
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (pages.length <= 1) return;
    if (prefersReducedMotion()) return;

    const t = window.setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setPage((p) => (p + 1) % pages.length);
        setFading(false);
      }, fadeMs);
    }, intervalMs);

    return () => window.clearInterval(t);
  }, [fadeMs, intervalMs, pages.length]);

  const visible = pages[page] ?? [];

  return (
    <div
      className={`relative grid gap-4 transition-opacity sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${fadeMs}ms` }}
      aria-live="polite"
    >
      {visible.map((c) => (
        <Link
          key={c.slug}
          href={`/clis/${c.slug}`}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-[0_20px_40px_-24px_var(--accent-glow)]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent opacity-0 transition group-hover:opacity-100" />
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">{c.name}</h3>
            {c.verified ? (
              <span className="shrink-0 rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">
                精选
              </span>
            ) : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{c.description}</p>
          {c.installCommand ? (
            <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--elevated)_55%,var(--surface)_45%)] p-3 font-mono text-xs text-[var(--foreground)] shadow-[inset_0_1px_0_color-mix(in_srgb,white_40%,transparent)] dark:bg-[color-mix(in_oklab,var(--surface)_80%,var(--palette-blue)_20%)]">
              <span className="font-semibold text-[var(--palette-blue)] dark:text-[var(--accent)]">$ </span>
              {c.installCommand}
            </pre>
          ) : null}
          <p className="mt-3 text-xs text-[var(--muted)]">@{c.ownerHandle} · ★ {c.githubStars.toLocaleString()}</p>
        </Link>
      ))}
    </div>
  );
}

