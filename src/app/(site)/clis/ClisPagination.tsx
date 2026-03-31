"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE } from "@/lib/clis-browse";

type Props = {
  pageIndex: number;
  totalPages: number;
  /** 不含 offset 的查询参数 */
  baseParams: Record<string, string>;
  hasPrev: boolean;
  hasNext: boolean;
};

function hrefForPage(pageIndex: number, baseParams: Record<string, string>, pageSize: number) {
  const u = new URLSearchParams(baseParams);
  if (pageIndex <= 0) u.delete("offset");
  else u.set("offset", String(pageIndex * pageSize));
  const qs = u.toString();
  return qs ? `/clis?${qs}` : "/clis";
}

function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const out: number[] = [];
  const add = (n: number) => {
    if (!out.includes(n)) out.push(n);
  };
  add(0);
  add(total - 1);
  for (let d = -2; d <= 2; d++) add(current + d);
  const sorted = [...new Set(out.filter((n) => n >= 0 && n < total))].sort((a, b) => a - b);
  const withGaps: (number | "gap")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) withGaps.push("gap");
    withGaps.push(sorted[i]!);
  }
  return withGaps;
}

export function ClisPagination({ pageIndex, totalPages, baseParams, hasPrev, hasNext }: Props) {
  const router = useRouter();
  const pages = pageWindow(pageIndex, totalPages);

  return (
    <nav
      className="flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-8"
      aria-label="分页"
    >
      <div className="flex items-center gap-2">
        <PaginationArrow
          href={hrefForPage(pageIndex - 1, baseParams, PAGE_SIZE)}
          disabled={!hasPrev}
          ariaLabel="上一页"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </PaginationArrow>

        <div className="flex items-center gap-1 px-1">
          {pages.map((p, i) =>
            p === "gap" ? (
              <span key={`g-${i}`} className="px-1 text-[var(--muted)]">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={hrefForPage(p, baseParams, PAGE_SIZE)}
                className={
                  p === pageIndex
                    ? "flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-semibold text-[var(--background)] shadow-md"
                    : "flex h-10 min-w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--foreground)]/20 dark:bg-[var(--surface)]"
                }
                aria-current={p === pageIndex ? "page" : undefined}
              >
                {p + 1}
              </Link>
            ),
          )}
        </div>

        <PaginationArrow
          href={hrefForPage(pageIndex + 1, baseParams, PAGE_SIZE)}
          disabled={!hasNext}
          ariaLabel="下一页"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </PaginationArrow>
      </div>

      <JumpToPageForm
        totalPages={totalPages}
        currentDisplay={pageIndex + 1}
        onJump={(oneBased) => {
          const idx = Math.max(1, Math.min(totalPages, oneBased)) - 1;
          router.push(hrefForPage(idx, baseParams, PAGE_SIZE));
        }}
      />
    </nav>
  );
}

function PaginationArrow({
  href,
  disabled,
  children,
  ariaLabel,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  if (disabled) {
    return (
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[var(--muted)] opacity-35"
        aria-disabled
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] shadow-sm transition hover:bg-[var(--elevated)] dark:bg-[var(--surface)]"
    >
      {children}
    </Link>
  );
}

function JumpToPageForm({
  totalPages,
  currentDisplay,
  onJump,
}: {
  totalPages: number;
  currentDisplay: number;
  onJump: (pageOneBased: number) => void;
}) {
  return (
    <form
      className="flex items-center gap-2 text-sm text-[var(--muted)]"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const raw = String(fd.get("page") ?? "").trim();
        const n = parseInt(raw, 10);
        if (!Number.isFinite(n)) return;
        onJump(n);
      }}
    >
      <span>跳至</span>
      <input
        name="page"
        type="number"
        min={1}
        max={totalPages}
        placeholder={String(currentDisplay)}
        className="w-16 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-center text-sm font-medium text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]/25 dark:bg-[var(--surface)]"
        aria-label="页码"
      />
      <span>页</span>
      <button
        type="submit"
        className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--elevated)] dark:bg-[var(--surface)]"
      >
        确定
      </button>
    </form>
  );
}
