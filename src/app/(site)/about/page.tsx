export const metadata = {
  title: "关于 Datawhale",
};

import Link from "next/link";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";

export default async function AboutPage() {
  const lang = await getLangFromServerCookies();
  return (
    <article className="max-w-3xl">
      <nav className="text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          {t(lang, "breadcrumb.home")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{t(lang, "about.breadcrumb")}</span>
      </nav>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{t(lang, "about.title")}</h1>
      <p className="mt-3 leading-relaxed text-[var(--muted)]">
        {t(lang, "about.lead")}
      </p>

      <section className="mt-12 space-y-8">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{t(lang, "about.who.title")}</h2>
          <p className="leading-relaxed text-[var(--muted)]">
            {t(lang, "about.who.body")}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{t(lang, "about.origin.title")}</h2>
          <p className="leading-relaxed text-[var(--muted)]">
            {t(lang, "about.origin.body")}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{t(lang, "about.mission.title")}</h2>
          <p className="leading-relaxed text-[var(--muted)]">
            {t(lang, "about.mission.body")}
          </p>
        </div>
      </section>
    </article>
  );
}

