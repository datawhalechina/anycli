import type { Prisma } from "@prisma/client";

/** 与 URL ?sort= 对齐；废弃的旧参数会回落到 views */
export const clisSortKeys = ["views", "stars", "newest", "updated", "name"] as const;

export type ClisSortKey = (typeof clisSortKeys)[number];
export type ClisSortDir = "asc" | "desc";
export type ClisViewMode = "cards" | "list";

const LEGACY_SORT_MAP: Record<string, ClisSortKey> = {
  downloads: "views",
  installs: "views",
  relevance: "views",
};

export function parseClisSort(value: unknown): ClisSortKey {
  if (typeof value !== "string") return "views";
  if (LEGACY_SORT_MAP[value]) return LEGACY_SORT_MAP[value];
  if ((clisSortKeys as readonly string[]).includes(value)) return value as ClisSortKey;
  return "views";
}

export function parseClisDir(value: unknown, sort: ClisSortKey): ClisSortDir {
  if (value === "asc" || value === "desc") return value;
  return defaultDirForSort(sort);
}

/** 切换排序维度时的默认方向（与 parseClisDir 一致） */
export function defaultDirForSort(sort: ClisSortKey): ClisSortDir {
  return sort === "name" ? "asc" : "desc";
}

export function parseClisView(value: unknown): ClisViewMode {
  if (value === "list") return "list";
  return "cards";
}

export type ClisBrowseState = {
  q: string;
  /** 分类 slug，与 categories JSON 中一致；空表示不限 */
  category: string;
  sort: ClisSortKey;
  dir: ClisSortDir;
  view: ClisViewMode;
  highlightedOnly: boolean;
  offset: number;
};

const PAGE_SIZE = 9;
/** 最大 offset，限制深度分页与批量爬取单接口数据量（可调） */
const MAX_OFFSET = PAGE_SIZE * 120;

const CATEGORY_SLUG = /^[a-z0-9][a-z0-9-]{0,31}$/;

function parseCategory(value: unknown): string {
  if (typeof value !== "string") return "";
  const t = value.trim().toLowerCase();
  if (!t || !CATEGORY_SLUG.test(t)) return "";
  if (t === "cli") return ""; // 不作为分类；旧链接 ?category=cli 视为未筛选
  return t;
}

export function parseClisBrowseState(sp: Record<string, string | string[] | undefined>): ClisBrowseState {
  const rawQ = sp.q;
  const q = typeof rawQ === "string" ? rawQ.trim() : "";
  const category = parseCategory(sp.category);
  const sort = parseClisSort(sp.sort);
  const dir = parseClisDir(sp.dir, sort);
  const view = parseClisView(sp.view);
  const highlightedOnly = sp.highlighted === "1" || sp.highlighted === "true";
  const offset = Math.min(MAX_OFFSET, Math.max(0, Number(sp.offset) || 0));
  return {
    q,
    category,
    sort,
    dir,
    view,
    highlightedOnly: Boolean(highlightedOnly),
    offset,
  };
}

export function clisBrowseHref(state: ClisBrowseState, patch?: Partial<ClisBrowseState>): string {
  const merged: ClisBrowseState = patch ? { ...state, ...patch } : { ...state };
  if (patch?.sort !== undefined && patch.sort !== state.sort) {
    merged.dir = parseClisDir(undefined, patch.sort);
  }
  if (patch && !Object.prototype.hasOwnProperty.call(patch, "offset")) {
    merged.offset = 0;
  }
  const u = new URLSearchParams();
  if (merged.q) u.set("q", merged.q);
  if (merged.category) u.set("category", merged.category);
  u.set("sort", merged.sort);
  u.set("dir", merged.dir);
  u.set("view", merged.view);
  if (merged.highlightedOnly) u.set("highlighted", "true");
  if (merged.offset > 0) u.set("offset", String(merged.offset));
  const qs = u.toString();
  return qs ? `/clis?${qs}` : "/clis";
}

export function clisBrowseLoadMoreHref(state: ClisBrowseState): string {
  const next = state.offset + PAGE_SIZE;
  if (next > MAX_OFFSET) return clisBrowseHref(state);
  return clisBrowseHref(state, { offset: next });
}

export function clisBrowsePageHref(state: ClisBrowseState, pageIndex: number): string {
  const offset = Math.min(MAX_OFFSET, Math.max(0, pageIndex * PAGE_SIZE));
  return clisBrowseHref(state, { offset });
}

export function maxBrowseOffset(): number {
  return MAX_OFFSET;
}

export { PAGE_SIZE };

export function buildClisWhere(
  state: Pick<ClisBrowseState, "q" | "category" | "highlightedOnly">,
): Prisma.CliToolWhereInput {
  const and: Prisma.CliToolWhereInput[] = [{ published: true }];
  if (state.highlightedOnly) and.push({ verified: true });
  if (state.category) {
    and.push({ categories: { contains: `"${state.category}"` } });
  }
  const q = state.q;
  if (q) {
    const lower = q.toLowerCase();
    and.push({
      OR: [
        { slug: { contains: lower } },
        { name: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: lower } },
      ],
    });
  }
  return { AND: and };
}

export function buildClisOrderBy(
  sort: ClisSortKey,
  dir: ClisSortDir,
): Prisma.CliToolOrderByWithRelationInput | Prisma.CliToolOrderByWithRelationInput[] {
  if (sort === "views") return [{ viewCount: dir }, { updatedAt: "desc" }];
  if (sort === "stars") return [{ githubStars: dir }, { updatedAt: "desc" }];
  if (sort === "newest") return { createdAt: dir };
  if (sort === "updated") return { updatedAt: dir };
  return { name: dir };
}
