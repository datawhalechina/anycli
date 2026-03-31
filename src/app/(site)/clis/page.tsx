import type { ComponentType } from "react";
import Link from "next/link";
import {
  Box,
  Code2,
  Eye,
  LayoutGrid,
  Music,
  Package,
  Palette,
  Search,
  Sparkles,
  Star,
  Terminal,
  Users,
  Video,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { categoryOptionLabel, listPublishedCategorySlugs } from "@/lib/clis-categories";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";
import {
  PAGE_SIZE,
  buildClisOrderBy,
  buildClisWhere,
  clisBrowseHref,
  clisBrowseLoadMoreHref,
  maxBrowseOffset,
  parseClisBrowseState,
} from "@/lib/clis-browse";
import { toPublicCli } from "@/lib/cli-json";
import { ClisPagination } from "./ClisPagination";
import { ClisToolbarClient } from "./ClisToolbarClient";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** 分类导航图标 */
const CATEGORY_ICON: Record<string, ComponentType<{ className?: string }>> = {
  "3d": Box,
  design: Palette,
  video: Video,
  music: Music,
  dev: Code2,
  ai: Sparkles,
  collaboration: Users,
  terminal: Terminal,
};

const PALETTE_CHIPS = ["palette-chip-0", "palette-chip-1", "palette-chip-2", "palette-chip-3"] as const;

function categoryRingClass(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * (i + 1)) % PALETTE_CHIPS.length;
  return PALETTE_CHIPS[h] ?? PALETTE_CHIPS[0];
}

function browseNavParams(state: ReturnType<typeof parseClisBrowseState>): Record<string, string> {
  const o: Record<string, string> = {
    sort: state.sort,
    dir: state.dir,
    view: state.view,
  };
  if (state.q) o.q = state.q;
  if (state.category) o.category = state.category;
  if (state.highlightedOnly) o.highlighted = "true";
  return o;
}

const PALETTE_AVATARS = ["palette-avatar-0", "palette-avatar-1", "palette-avatar-2", "palette-avatar-3"] as const;

function avatarPresetClass(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % PALETTE_AVATARS.length;
  return PALETTE_AVATARS[h] ?? PALETTE_AVATARS[0];
}

function formatCompact(n: number) {
  return new Intl.NumberFormat("zh-CN", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function initialLetter(name: string) {
  const t = name.trim();
  if (!t) return "?";
  return t[0]!.toUpperCase();
}

const LIST_GRID =
  "grid grid-cols-1 gap-3 border-b border-[var(--border)] px-4 py-4 text-sm last:border-b-0 sm:grid-cols-12 sm:items-center sm:gap-4 sm:px-5";

export default async function ClisBrowsePage({ searchParams }: Props) {
  const lang = await getLangFromServerCookies();
  const sp = await searchParams;
  const state = parseClisBrowseState(sp);
  const where = buildClisWhere(state);
  const orderBy = buildClisOrderBy(state.sort, state.dir);

  const [total, rows, categorySlugs] = await Promise.all([
    prisma.cliTool.count({ where }),
    prisma.cliTool.findMany({
      where,
      skip: state.offset,
      take: PAGE_SIZE,
      orderBy,
      include: { author: { select: { handle: true, name: true, image: true } } },
    }),
    listPublishedCategorySlugs(),
  ]);

  const locale = lang === "en" ? "en-US" : "zh-CN";
  const totalLabel = total.toLocaleString(locale);
  const maxOff = maxBrowseOffset();
  const canLoadMore = rows.length === PAGE_SIZE && state.offset + PAGE_SIZE < total;
  const pageIndex = Math.floor(state.offset / PAGE_SIZE);
  const totalPages = Math.max(1, Math.min(Math.ceil(total / PAGE_SIZE), Math.floor(maxOff / PAGE_SIZE) + 1));
  const hasPrev = pageIndex > 0;
  const hasNext = canLoadMore && state.offset + PAGE_SIZE <= maxOff;

  const navParams = browseNavParams(state);
  const categoryOptions = categorySlugs.map((slug) => ({
    slug,
    label: categoryOptionLabel(slug),
  }));

  return (
    <div className="relative -mx-4 min-w-0 px-4 pb-16 pt-2 sm:-mx-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-[var(--browse-sheet)]" aria-hidden />

      {/* 头图区 */}
      <header className="mx-auto max-w-3xl px-2 pt-8 text-center sm:pt-10">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">{t(lang, "clis.title")}</h1>
        <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
          {t(lang, "clis.stats").replace("{total}", totalLabel)}
        </p>
        {state.q || state.category || state.highlightedOnly ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            {t(lang, "clis.filters.current")}
            {[state.highlightedOnly ? t(lang, "clis.filters.highlighted") : null, state.category ? categoryOptionLabel(state.category) : null, state.q ? `「${state.q}」` : null]
              .filter(Boolean)
              .join(" · ") || "—"}
            <Link href={clisBrowseHref(state, { q: "", category: "", highlightedOnly: false, offset: 0 })} className="ml-2 text-[var(--accent)] hover:underline">
              {t(lang, "clis.filters.clear")}
            </Link>
          </p>
        ) : null}
      </header>

      {/* 分类导航 — 横向卡片 */}
      <section className="mx-auto mt-10 max-w-6xl">
        <h2 className="sr-only">分类</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={clisBrowseHref(state, { category: "", offset: 0 })}
            className={`flex min-w-[5.5rem] flex-col items-center rounded-2xl border px-4 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              !state.category
                ? "border-[var(--foreground)]/20 bg-white ring-2 ring-[var(--foreground)]/15 dark:bg-[var(--surface)]"
                : "border-[var(--border)] bg-white dark:bg-[var(--surface)]"
            }`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full ring-2 ${
                !state.category ? "bg-[var(--foreground)] text-[var(--background)] ring-[var(--foreground)]/20" : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
              }`}
            >
              <LayoutGrid className="h-5 w-5" aria-hidden />
            </span>
            <span className="mt-2 text-xs font-medium text-[var(--foreground)]">{t(lang, "clis.category.all")}</span>
          </Link>
          {categoryOptions.map(({ slug, label }) => {
            const Icon = CATEGORY_ICON[slug] ?? Terminal;
            const active = state.category === slug;
            const ring = categoryRingClass(slug);
            return (
              <Link
                key={slug}
                href={clisBrowseHref(state, { category: slug, offset: 0 })}
                className={`flex min-w-[5.5rem] flex-col items-center rounded-2xl border px-4 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  active ? "border-[var(--accent)]/40 bg-white ring-2 ring-[var(--accent)]/25 dark:bg-[var(--surface)]" : "border-[var(--border)] bg-white dark:bg-[var(--surface)]"
                }`}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-full ${ring}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="mt-2 max-w-[6rem] truncate text-xs font-medium text-[var(--foreground)]" title={label}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 搜索 + 工具栏 */}
      <section className="mx-auto mt-8 max-w-6xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <form method="get" className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-0">
            <input type="hidden" name="sort" value={state.sort} />
            <input type="hidden" name="dir" value={state.dir} />
            <input type="hidden" name="view" value={state.view} />
            {state.highlightedOnly ? <input type="hidden" name="highlighted" value="true" /> : null}
            {state.category ? <input type="hidden" name="category" value={state.category} /> : null}
            <div className="relative min-h-[3.5rem] flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" aria-hidden />
              <input
                name="q"
                defaultValue={state.q}
                placeholder={t(lang, "clis.search.placeholder")}
                className="h-14 w-full rounded-full border border-[var(--border)] bg-white py-3 pl-14 pr-4 text-[var(--foreground)] shadow-sm outline-none ring-[var(--accent)]/0 transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]/30 focus:ring-4 focus:ring-[var(--accent)]/15 sm:pr-28 dark:bg-[var(--surface)]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-[var(--foreground)] px-5 py-2 text-sm font-semibold text-[var(--background)] shadow-sm sm:inline-block"
              >
                {t(lang, "clis.search.submit")}
              </button>
            </div>
            <button
              type="submit"
              className="h-11 rounded-full bg-[var(--foreground)] text-sm font-semibold text-[var(--background)] shadow-sm sm:hidden"
            >
              {t(lang, "clis.search.submit")}
            </button>
          </form>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={clisBrowseHref(state, { highlightedOnly: !state.highlightedOnly, offset: 0 })}
              className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                state.highlightedOnly
                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-md"
                  : "border border-[var(--border)] bg-white text-[var(--muted)] hover:text-[var(--foreground)] dark:bg-[var(--surface)]"
              }`}
            >
              {t(lang, "clis.filters.highlighted")}
            </Link>
            <ClisToolbarClient state={state} lang={lang} />
          </div>
        </div>
      </section>

      {/* 分页统计文案已移除 */}

      {rows.length === 0 ? (
        <p className="mx-auto mt-12 max-w-lg rounded-2xl border border-dashed border-[var(--border)] bg-white/80 p-10 text-center text-[var(--muted)] dark:bg-[var(--surface)]/80">
          {t(lang, "clis.empty")}
        </p>
      ) : state.view === "cards" ? (
        <ul className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const c = toPublicCli(row);
            const letter = initialLetter(c.name);
            const av = avatarPresetClass(c.slug);
            return (
              <li key={c.slug}>
                <Link
                  href={`/clis/${c.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_4px_24px_-8px_rgba(68,172,255,0.14)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(254,158,199,0.22)] dark:border-white/10 dark:shadow-none dark:hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.45)]"
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${av}`}
                      aria-hidden
                    >
                      {letter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--accent)]">
                          {c.name}
                        </h3>
                        {c.verified ? (
                          <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                            {t(lang, "clis.card.badge.highlighted")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-[var(--muted)]">{c.slug}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{c.description}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      <span className="tabular-nums">{formatCompact(c.viewCount)}</span>
                      <span className="text-[10px] opacity-80">{t(lang, "clis.metric.views")}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      <span className="tabular-nums">{formatCompact(c.githubStars)}</span>
                    </span>
                    {c.version ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                        <span className="font-mono text-[11px] text-[var(--foreground)]">v{c.version}</span>
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mx-auto mt-10 max-w-6xl overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm dark:bg-[var(--surface)]">
          <div
            className={`${LIST_GRID} border-b border-[var(--border)] bg-[var(--browse-sheet)] py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]`}
          >
            <span className="sm:col-span-4">{t(lang, "clis.table.cli")}</span>
            <span className="sm:col-span-5">{t(lang, "clis.table.desc")}</span>
            <span className="sm:col-span-1 sm:text-right">★</span>
            <span className="sm:col-span-2 sm:text-right">{t(lang, "clis.metric.views")}</span>
          </div>
          {rows.map((row) => {
            const c = toPublicCli(row);
            const av = avatarPresetClass(c.slug);
            return (
              <Link key={c.slug} href={`/clis/${c.slug}`} className={`${LIST_GRID} transition hover:bg-[color-mix(in_srgb,var(--palette-sky)_12%,transparent)] dark:hover:bg-[var(--elevated)]/40`}>
                <div className="flex items-center gap-3 sm:col-span-4 sm:min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${av}`}>
                    {initialLetter(c.name)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-[var(--foreground)]">{c.name}</span>
                    <span className="mt-0.5 block truncate font-mono text-xs text-[var(--muted)]">{c.slug}</span>
                  </div>
                </div>
                <p className="line-clamp-2 text-[var(--muted)] sm:col-span-5 sm:min-w-0">{c.description}</p>
                <span className="tabular-nums text-[var(--muted)] sm:col-span-1 sm:text-right">{formatCompact(c.githubStars)}</span>
                <span className="tabular-nums text-[var(--muted)] sm:col-span-2 sm:text-right">{formatCompact(c.viewCount)}</span>
              </Link>
            );
          })}
        </div>
      )}

      {total > 0 ? (
        <div className="mx-auto mt-12 max-w-6xl">
          <ClisPagination
            pageIndex={pageIndex}
            totalPages={totalPages}
            baseParams={navParams}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
        </div>
      ) : null}

      {canLoadMore && state.offset + PAGE_SIZE <= maxOff ? (
        <div className="mt-8 flex justify-center">
          <Link
            href={clisBrowseLoadMoreHref(state)}
            className="rounded-full border border-[var(--border)] bg-white px-8 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-[var(--elevated)] dark:bg-[var(--surface)]"
          >
            {t(lang, "clis.loadMore")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
