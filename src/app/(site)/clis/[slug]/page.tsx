import Link from "next/link";
import { notFound } from "next/navigation";
import { Bot, ExternalLink } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recordCliView } from "@/lib/pv";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";
import { OwnerCliActions } from "./OwnerCliActions";
import { CopyCliButton } from "./ui";
import { installCommand, toPublicCli } from "@/lib/cli-json";

type Props = { params: Promise<{ slug: string }> };

export default async function CliDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const lang = await getLangFromServerCookies();

  const base = await prisma.cliTool.findFirst({
    where: { slug },
    include: { author: { select: { handle: true, name: true, image: true } } },
  });
  if (!base) notFound();

  const isOwner = session?.user?.id === base.authorId;
  const canViewDraft = isOwner || Boolean(session?.user?.isAdmin);
  if (!base.published && !canViewDraft) notFound();

  if (base.published) {
    // 不阻塞渲染：PV 计数异步批量回写
    void recordCliView(base.id);
  }
  const row = base;

  const c = toPublicCli(row);
  const install = installCommand(row);
  const hints =
    c.agentHints && typeof c.agentHints === "object"
      ? (c.agentHints as Record<string, unknown>)
      : null;

  return (
    <article>
      <nav className="text-sm text-[var(--muted)]">
        <Link href="/clis" className="hover:text-[var(--accent)]">
          {t(lang, "clis.breadcrumb")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{c.slug}</span>
      </nav>

      {!row.published ? (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {t(lang, "clis.draft.notice")}
        </div>
      ) : null}

      <header className="mt-6 flex flex-col gap-4 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{c.name}</h1>
            {c.verified ? (
              <span className="rounded-lg bg-[var(--accent-soft)] px-2 py-1 text-xs font-medium text-[var(--accent)]">
                {t(lang, "clis.verified")}
              </span>
            ) : null}
          </div>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--muted)]">{c.description}</p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            {t(lang, "clis.maintainer")}{" "}
            <Link href={`/u/${c.owner.handle}`} className="font-medium text-[var(--accent)] hover:underline">
              @{c.owner.handle}
            </Link>
            {c.version ? ` · ${t(lang, "clis.version")} ${c.version}` : null}
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-end">
          <div className="flex flex-wrap gap-2">
          {c.repository ? (
            <a
              href={c.repository}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium hover:bg-[var(--elevated)]"
            >
              {t(lang, "clis.link.source")} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
          {c.homepage ? (
            <a
              href={c.homepage}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium hover:bg-[var(--elevated)]"
            >
              {t(lang, "clis.link.homepage")} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
          {c.docsUrls.length > 0 ? (
            <a
              href={c.docsUrls[0]}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium hover:bg-[var(--elevated)]"
            >
              {t(lang, "clis.link.docs")} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
          </div>
          {isOwner ? <OwnerCliActions slug={c.slug} lang={lang} /> : null}
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{t(lang, "clis.section.installRun")}</h2>
          {install ? (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--muted)]">{t(lang, "clis.install.recommended")}</span>
                <CopyCliButton text={install} label={t(lang, "clis.install.copy")} lang={lang} />
              </div>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-[var(--elevated)] p-4 font-mono text-sm">{install}</pre>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">{t(lang, "clis.install.missing")}</p>
          )}
          {c.runExample ? (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--muted)]">{t(lang, "clis.example")}</span>
                <CopyCliButton text={c.runExample} label={t(lang, "clis.example.copy")} lang={lang} />
              </div>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-[var(--elevated)] p-4 font-mono text-sm">{c.runExample}</pre>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{t(lang, "clis.section.meta")}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {c.license ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">{t(lang, "clis.meta.license")}</dt>
                <dd className="text-[var(--foreground)]">{c.license}</dd>
              </div>
            ) : null}
            {c.binaryName ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">{t(lang, "clis.meta.binary")}</dt>
                <dd className="font-mono text-[var(--foreground)]">{c.binaryName}</dd>
              </div>
            ) : null}
            {c.docsUrls.length > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">{t(lang, "clis.meta.docs")}</dt>
                <dd className="text-right">
                  {c.docsUrls.slice(0, 3).map((u) => (
                    <a
                      key={u}
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:underline"
                    >
                      {t(lang, "clis.meta.link")} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ))}
                  {c.docsUrls.length > 3 ? (
                    <span className="ml-2 text-[var(--muted)]">+{c.docsUrls.length - 3}</span>
                  ) : null}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">{t(lang, "clis.meta.tags")}</dt>
              <dd className="text-right text-[var(--foreground)]">{c.tags.join(", ") || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">{t(lang, "clis.meta.categories")}</dt>
              <dd className="text-right text-[var(--foreground)]">{c.categories.join(", ") || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">GitHub Star</dt>
              <dd className="tabular-nums text-[var(--foreground)]">{c.githubStars.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </section>

      {hints?.when_to_use || Array.isArray(hints?.example_usage) ? (
        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            <Bot className="h-4 w-4" aria-hidden />
            {t(lang, "clis.section.agent")}
          </h2>
          {typeof hints.when_to_use === "string" ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--foreground)]">
              {hints.when_to_use}
            </p>
          ) : null}
          {Array.isArray(hints.example_usage) ? (
            <ul className="mt-4 list-inside list-disc space-y-2 font-mono text-xs text-[var(--muted)]">
              {(hints.example_usage as string[]).slice(0, 10).map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
