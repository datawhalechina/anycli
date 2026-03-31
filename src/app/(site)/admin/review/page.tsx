import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { installCommand } from "@/lib/cli-json";
import { approveCli } from "./actions";

export default async function AdminReviewPage() {
  const pending = await prisma.cliTool.findMany({
    where: { published: false },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, handle: true, email: true, name: true } } },
  });

  return (
    <div>
      <div className="border-b border-[var(--border)] pb-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">待审核 CLI</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          用户通过网页发布后默认为未上架。通过后公开收录目录；可同时勾选「精选」以标记 <code className="font-mono text-xs">verified</code>。
        </p>
      </div>

      {pending.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
          当前没有待审核条目。
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-6">
          {pending.map((row) => {
            const cmd = installCommand(row);
            const author = row.author;
            return (
              <li
                key={row.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">{row.name}</h2>
                    <p className="font-mono text-xs text-[var(--muted)]">{row.slug}</p>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    提交者{" "}
                    <Link href={`/u/${author.handle}`} className="text-[var(--accent)] hover:underline">
                      @{author.handle}
                    </Link>
                    <span className="mx-1">·</span>
                    <span className="break-all">{author.email}</span>
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{row.description}</p>
                {cmd ? (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-[var(--elevated)] p-3 font-mono text-xs text-[var(--foreground)]">
                    {cmd}
                  </pre>
                ) : null}

                <form action={approveCli} className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <input type="hidden" name="cliId" value={row.id} />
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]">
                    <input type="checkbox" name="featured" className="rounded border-[var(--border)]" />
                    同时标为精选（verified）
                  </label>
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                  >
                    通过并上架
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
