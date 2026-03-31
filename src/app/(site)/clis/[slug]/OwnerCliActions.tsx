"use client";

import Link from "next/link";
import { DeleteCliButton } from "@/components/DeleteCliButton";
import { t, type Lang } from "@/i18n/messages";

export function OwnerCliActions({ slug, lang }: { slug: string; lang: Lang }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-6 sm:border-t-0 sm:pt-0">
      <span className="w-full text-xs font-medium uppercase tracking-wide text-[var(--muted)] sm:w-auto sm:mr-1">
        {t(lang, "clis.owner.section")}
      </span>
      <Link
        href={`/publish/edit/${encodeURIComponent(slug)}`}
        className="inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)]/40 hover:bg-[var(--elevated)]"
      >
        {t(lang, "clis.owner.edit")}
      </Link>
      <DeleteCliButton slug={slug} variant="subtle" redirectTo="/dashboard" />
    </div>
  );
}
