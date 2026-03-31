"use client";

import { useRouter } from "next/navigation";

type Props = {
  value: string;
  options: { slug: string; label: string }[];
  baseParams: Record<string, string>;
};

/** 切换分类时保留排序、视图、关键词、精选筛选，并重置 offset */
export function CategorySelect({ value, options, baseParams }: Props) {
  const router = useRouter();

  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-[var(--foreground)] sm:min-w-[11rem]">
      分类
      <select
        value={value}
        onChange={(e) => {
          const u = new URLSearchParams(baseParams);
          const v = e.target.value;
          if (v) u.set("category", v);
          else u.delete("category");
          u.delete("offset");
          router.push(u.toString() ? `/clis?${u}` : "/clis");
        }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[var(--foreground)] outline-none focus:ring-4 focus:ring-[var(--accent)]/20"
      >
        <option value="">全部分类</option>
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
