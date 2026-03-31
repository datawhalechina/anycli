"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import {
  clisBrowseHref,
  defaultDirForSort,
  type ClisBrowseState,
  type ClisSortKey,
} from "@/lib/clis-browse";
import { t, type Lang } from "@/i18n/messages";

const SORT_OPTIONS: { key: ClisSortKey; labelKey: string }[] = [
  { key: "views", labelKey: "clis.sort.views" },
  { key: "stars", labelKey: "clis.sort.stars" },
  { key: "newest", labelKey: "clis.sort.newest" },
  { key: "updated", labelKey: "clis.sort.updated" },
  { key: "name", labelKey: "clis.sort.name" },
];

type Props = {
  state: ClisBrowseState;
  lang: Lang;
};

export function ClisToolbarClient({ state, lang }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <span className="shrink-0">{t(lang, "clis.sort")}</span>
        <select
          value={state.sort}
          onChange={(e) => {
            const sort = e.target.value as ClisSortKey;
            const dir = defaultDirForSort(sort);
            router.push(
              clisBrowseHref(state, {
                sort,
                dir,
                offset: 0,
              }),
            );
          }}
          className="min-w-[11rem] rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-sm outline-none transition hover:border-[var(--foreground)]/15 focus:ring-2 focus:ring-[var(--accent)]/25 dark:bg-[var(--surface)]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {t(lang, opt.labelKey)}
            </option>
          ))}
        </select>
      </label>
      <Link
        href={clisBrowseHref(state, { dir: state.dir === "asc" ? "desc" : "asc" })}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] shadow-sm transition hover:bg-[var(--elevated)] dark:bg-[var(--surface)]"
        title={state.dir === "asc" ? t(lang, "clis.sort.dir.asc") : t(lang, "clis.sort.dir.desc")}
        aria-label={`排序方向 ${state.dir}`}
      >
        {state.dir === "asc" ? "↑" : "↓"}
      </Link>
      <Link
        href={clisBrowseHref(state, { view: state.view === "cards" ? "list" : "cards" })}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--elevated)] dark:bg-[var(--surface)]"
      >
        {state.view === "cards" ? (
          <>
            <List className="h-4 w-4" aria-hidden />
            {t(lang, "clis.view.list")}
          </>
        ) : (
          <>
            <LayoutGrid className="h-4 w-4" aria-hidden />
            {t(lang, "clis.view.cards")}
          </>
        )}
      </Link>
    </div>
  );
}
