import Link from "next/link";
import { auth } from "@/auth";
import { DeleteCliButton } from "@/components/DeleteCliButton";
import { prisma } from "@/lib/prisma";
import { installCommand, toPublicCli } from "@/lib/cli-json";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const lang = await getLangFromServerCookies();

  const mine = await prisma.cliTool.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { handle: true, name: true, image: true } } },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{t(lang, "dashboard.title")}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{t(lang, "dashboard.subtitle")}</p>
        </div>
        <Link
          href="/publish"
          className="inline-flex justify-center rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          {t(lang, "dashboard.new")}
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{t(lang, "dashboard.myClis")}</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {mine.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
              {t(lang, "dashboard.empty")}{" "}
              <Link href="/publish" className="text-[var(--accent)] hover:underline">
                {t(lang, "nav.publish")}
              </Link>{" "}
            </li>
          ) : (
            mine.map((row) => {
              const c = toPublicCli(row);
              const cmd = installCommand(row);
              return (
                <li
                  key={c.slug}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:flex-row sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <Link href={`/clis/${c.slug}`} className="font-semibold text-[var(--foreground)] hover:text-[var(--accent)]">
                      {c.name}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-[var(--muted)]">{c.slug}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{c.description}</p>
                    {row.published === false ? (
                      <span className="mt-2 inline-block text-xs text-amber-600 dark:text-amber-400">
                        {t(lang, "dashboard.pendingReview")}
                      </span>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/publish/edit/${encodeURIComponent(c.slug)}`}
                        className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)]/35"
                      >
                        {t(lang, "dashboard.edit")}
                      </Link>
                      <Link
                        href={`/clis/${c.slug}`}
                        className="inline-flex rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]"
                      >
                        {t(lang, "dashboard.detail")}
                      </Link>
                      <DeleteCliButton slug={c.slug} variant="subtle" />
                    </div>
                  </div>
                  {cmd ? (
                    <pre className="max-w-full shrink-0 overflow-x-auto self-start rounded-xl bg-[var(--elevated)] p-3 font-mono text-xs sm:max-w-xs">
                      {cmd}
                    </pre>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}
