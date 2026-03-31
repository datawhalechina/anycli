import Link from "next/link";
import { ArrowRight, Bot, Sparkles, Terminal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TerminalHero } from "@/components/TerminalHero";
import { installCommand, toPublicCli } from "@/lib/cli-json";
import { FeaturedRotatingGrid, type FeaturedCard } from "@/app/(site)/FeaturedRotatingGrid";
import { HeroTypeTitle } from "@/app/(site)/HeroTypeTitle";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";

/** 构建阶段不必连库；页面在请求时再读 MySQL。 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const lang = await getLangFromServerCookies();
  const featured = await prisma.cliTool.findMany({
    where: { published: true },
    take: 18,
    orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }],
    include: { author: { select: { handle: true, name: true, image: true } } },
  });

  const featuredCards: FeaturedCard[] = featured.map((row) => {
    const c = toPublicCli(row);
    return {
      slug: c.slug,
      name: c.name,
      description: c.description,
      verified: c.verified,
      ownerHandle: c.owner.handle,
      githubStars: c.githubStars,
      installCommand: installCommand(row),
    };
  });

  return (
    <div className="-mt-10 sm:-mt-14">
      <section
        className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden shadow-[0_18px_48px_-50px_var(--accent-glow)]"
        aria-labelledby="hero-heading"
      >
        <div className="hero-open-mesh pointer-events-none absolute inset-0 opacity-[0.42] dark:opacity-[0.26]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[color-mix(in_oklab,var(--background)_78%,transparent)] dark:bg-[color-mix(in_oklab,var(--background)_72%,transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_55%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_58%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute -left-[12%] top-[18%] h-[min(52vw,420px)] w-[min(52vw,420px)] rounded-full bg-[var(--accent)]/18 blur-[100px] dark:bg-[var(--accent)]/12" aria-hidden />
        <div className="pointer-events-none absolute -right-[8%] bottom-[-12%] h-[min(48vw,380px)] w-[min(48vw,380px)] rounded-full bg-[var(--agent-tint)] blur-[90px]" aria-hidden />
        {/* 底部淡出：自上而下渐变为透明，让固定层网格与页面背景自然衔接，避免水平硬边 */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(48vh,23rem)] bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--background)_52%,transparent)_0%,color-mix(in_oklab,var(--background)_18%,transparent)_38%,color-mix(in_oklab,var(--background)_6%,transparent)_62%,transparent_100%)] sm:h-[min(52vh,26rem)] dark:bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--background)_45%,transparent)_0%,color-mix(in_oklab,var(--background)_12%,transparent)_42%,color-mix(in_oklab,var(--background)_4%,transparent)_65%,transparent_100%)]"
          aria-hidden
        />

        <div className="relative z-[1] mx-auto flex min-h-[min(78svh,820px)] w-full max-w-6xl flex-col justify-center px-4 pb-10 pt-[4.75rem] sm:min-h-[min(84svh,900px)] sm:px-6 sm:pb-14 sm:pt-[6.5rem] lg:min-h-[min(86svh,940px)] lg:pb-20 lg:pt-[7.25rem]">
          <div className="grid flex-1 items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-14">
            <div className="flex min-w-0 flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left">
              <div className="flex w-full max-w-xl flex-col items-center gap-6 sm:gap-7 lg:max-w-none lg:items-start">
                <p className="hero-open-fade-up inline-flex max-w-prose items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[var(--accent)] shadow-sm backdrop-blur-md lg:justify-start">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t(lang, "home.hero.badge")}
                </p>

                <div className="w-full space-y-5 sm:space-y-6">
                  <h1
                    id="hero-heading"
                    className="hero-open-fade-up hero-open-delay-1 text-balance font-bold leading-[1.08] tracking-[-0.04em] text-[var(--foreground)]"
                  >
                    <span className="sr-only">AnyCLI — </span>
                    <HeroTypeTitle
                      line1={t(lang, "home.hero.line1")}
                      line2={t(lang, "home.hero.line2")}
                      line1ClassName="block max-w-[22ch] text-[clamp(2rem,9vw,4.75rem)] text-[var(--muted)] lg:max-w-none sm:text-[var(--foreground)]"
                      line2ClassName="mt-2 block max-w-[20ch] bg-gradient-to-r from-[var(--palette-blue)] via-[var(--palette-pink)] to-[var(--palette-sky)] bg-clip-text text-[clamp(2.15rem,10vw,5rem)] text-transparent sm:mt-3 lg:max-w-none"
                      cursorClassName="bg-gradient-to-b from-[var(--palette-blue)] to-[var(--palette-pink)]"
                      typeMs={44}
                      pauseMs={240}
                    />
                  </h1>
                  <p className="hero-open-fade-up hero-open-delay-2 text-pretty text-[0.9375rem] leading-[1.75] text-[var(--muted)] sm:text-lg lg:max-w-[40rem]">
                    {t(lang, "home.hero.p1a")}{" "}
                    <strong className="font-semibold text-[var(--foreground)]">{t(lang, "home.hero.p1b")}</strong>
                    {lang === "en" ? " " : ""}
                    {t(lang, "home.hero.p1c")}
                    {lang === "en" ? " " : ""}
                    <strong className="font-semibold text-[var(--foreground)]">{t(lang, "home.hero.p1d")}</strong>
                    {lang === "en" ? " " : ""}
                    {t(lang, "home.hero.p1e")}
                  </p>
                  <p className="hero-open-fade-up hero-open-delay-2 border-l-2 border-[var(--accent)]/55 pl-4 text-pretty text-[0.9375rem] font-medium leading-[1.65] text-[var(--foreground)] sm:text-base lg:max-w-[40rem]">
                    {t(lang, "home.hero.p2")}
                  </p>
                  <p className="hero-open-fade-up hero-open-delay-2 text-pretty text-[0.8125rem] leading-[1.65] text-[var(--muted)] sm:text-sm lg:max-w-[40rem]">
                    {t(lang, "home.hero.p3")}
                  </p>
                </div>
              </div>

              <div className="hero-open-fade-up hero-open-delay-3 mt-9 flex w-full max-w-xl flex-wrap justify-center gap-3 sm:mt-12 lg:justify-start">
                <Link
                  href="/clis"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/25 ring-1 ring-white/15 transition hover:brightness-105 sm:min-h-12 sm:px-6 sm:py-3 sm:text-base"
                >
                  <Bot className="h-4 w-4 shrink-0" aria-hidden />
                  {t(lang, "home.hero.cta.explore")}
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                </Link>
                <Link
                  href="/publish"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_90%,transparent)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm backdrop-blur-md transition hover:border-[var(--accent)]/45 hover:bg-[var(--elevated)]/35 sm:min-h-12 sm:px-6 sm:py-3 sm:text-base"
                >
                  <Terminal className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                  {t(lang, "home.hero.cta.publish")}
                </Link>
                {lang === "en" ? (
                  <Link
                    href="/readme-en"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)] shadow-sm transition hover:bg-[var(--elevated)] hover:text-[var(--foreground)] sm:min-h-12 sm:px-6 sm:py-3 sm:text-base"
                  >
                    {t(lang, "home.hero.cta.readmeEn")}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="hero-open-fade-up hero-open-delay-4 w-full lg:col-span-6 lg:pt-1">
              <TerminalHero variant="brand" className="w-full" lang={lang} />
            </div>
          </div>
        </div>
      </section>

      <div
        className="pointer-events-none relative left-1/2 -mt-10 w-screen max-w-[100vw] -translate-x-1/2 sm:-mt-14"
        aria-hidden
      >
        <div className="h-16 w-full bg-gradient-to-b from-transparent via-[color-mix(in_oklab,var(--background)_8%,transparent)] to-[color-mix(in_oklab,var(--background)_3%,transparent)] sm:h-20" />
      </div>

      <div className="space-y-10 sm:space-y-12">
        <section className="relative scroll-mt-8 -mt-6 pt-2 sm:-mt-8 sm:pt-3">
          <div className="relative mb-8 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="min-w-0 space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-[1.75rem]">
                {t(lang, "home.featured.title")}
              </h2>
              <p className="max-w-2xl text-sm leading-[1.65] text-[var(--muted)] sm:text-[0.9375rem]">
                {t(lang, "home.featured.desc")}
              </p>
            </div>
            <Link
              href="/clis"
              className="inline-flex shrink-0 items-center justify-center self-start rounded-xl border border-transparent bg-[var(--accent-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:border-[var(--accent)]/25 hover:ring-2 hover:ring-[var(--accent)]/15 sm:self-auto"
            >
              {t(lang, "home.featured.all")}
            </Link>
          </div>
          {featuredCards.length === 0 ? (
              <p className="col-span-full rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 p-8 text-center text-[var(--muted)] backdrop-blur-sm">
                {t(lang, "home.featured.empty")}
              </p>
            ) : null}
          {featuredCards.length > 0 ? <FeaturedRotatingGrid cards={featuredCards} /> : null}
        </section>

        <section className="overflow-hidden rounded-[1.35rem] border border-[var(--border)]/40 bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] shadow-[0_16px_44px_-42px_var(--accent-glow)] backdrop-blur-md dark:border-[var(--border)]/30 dark:bg-[color-mix(in_oklab,var(--surface)_78%,transparent)]">
          <div className="px-5 py-9 sm:px-8 sm:py-10">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{t(lang, "home.about.kicker")}</p>
              <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-[1.4rem]">
                {t(lang, "home.about.title")}
              </h2>
              <p className="text-sm leading-[1.65] text-[var(--muted)] sm:text-[0.9375rem]">
                {t(lang, "home.about.desc")}
              </p>
            </div>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition hover:gap-2"
            >
              {t(lang, "home.about.cta")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
