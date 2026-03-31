import { prisma } from "@/lib/prisma";

function parseCategoriesJson(s: string): string[] {
  try {
    const v = JSON.parse(s) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

const SLUG = /^[a-z0-9][a-z0-9-]{0,31}$/;

/** 浏览页分类顺序：先场景（3D / 设计 / 音视频），再工程与协作类 */
export const SCENE_CATEGORY_ORDER = [
  "3d",
  "design",
  "video",
  "music",
  "dev",
  "ai",
  "collaboration",
  "terminal",
] as const;

/** 已发布条目中的分类 + 标准场景表（含暂无条目的 3d/design，便于筛选入口一致） */
export async function listPublishedCategorySlugs(): Promise<string[]> {
  const rows = await prisma.cliTool.findMany({
    where: { published: true },
    select: { categories: true },
  });
  const set = new Set<string>(SCENE_CATEGORY_ORDER);
  for (const r of rows) {
    for (const c of parseCategoriesJson(r.categories)) {
      const t = c.trim().toLowerCase();
      if (t === "cli") continue; // 全站即 CLI，不作为分类维度
      if (SLUG.test(t)) set.add(t);
    }
  }
  set.delete("cli");
  const list = Array.from(set);
  const orderIndex = (s: string) => {
    const i = SCENE_CATEGORY_ORDER.indexOf(s as (typeof SCENE_CATEGORY_ORDER)[number]);
    return i >= 0 ? i : SCENE_CATEGORY_ORDER.length;
  };
  return list.sort((a, b) => {
    const da = orderIndex(a);
    const db = orderIndex(b);
    if (da !== db) return da - db;
    return a.localeCompare(b);
  });
}

/** 下拉展示名（场景为主；保留旧 slug 以免未跑 catalog:load 时显示生硬） */
export function categoryOptionLabel(slug: string): string {
  const map: Record<string, string> = {
    "3d": "3D / CG",
    design: "设计",
    video: "视频",
    music: "音乐",
    dev: "开发与工程",
    ai: "AI / 智能体",
    collaboration: "办公与协作",
    terminal: "终端与效率",
    // 旧版 slug（数据迁移前仍可能出现）
    api: "API",
    ci: "CI",
    data: "数据 / JSON",
    enterprise: "企业",
    "package-manager": "包管理",
    javascript: "JavaScript",
    lint: "代码检查",
    local: "本地",
    media: "音视频",
    productivity: "效率",
    python: "Python",
    runtime: "运行时",
    search: "搜索",
    inference: "推理",
    editor: "编辑",
  };
  return map[slug] ?? slug;
}
