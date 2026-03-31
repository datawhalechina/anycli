"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  slug: string;
  /** 删除成功后跳转，默认控制台 */
  redirectTo?: string;
  className?: string;
  variant?: "danger" | "subtle";
};

export function DeleteCliButton({
  slug,
  redirectTo = "/dashboard",
  className = "",
  variant = "danger",
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!window.confirm("确定删除该 CLI？此操作不可恢复。")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/clis/${encodeURIComponent(slug)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        window.alert(typeof data.error === "string" ? data.error : "删除失败");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const base =
    variant === "subtle"
      ? "rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted)] hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-400"
      : "rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-600";

  return (
    <button type="button" className={`${base} ${className}`} disabled={pending} onClick={onClick}>
      {pending ? "删除中…" : "删除"}
    </button>
  );
}
