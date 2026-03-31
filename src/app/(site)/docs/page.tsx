import Link from "next/link";
import { CopyCodeBlock } from "./CopyCodeBlock";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";

export const metadata = {
  title: "使用文档",
};

export default async function DocsPage() {
  const lang = await getLangFromServerCookies();
  return (
    <article className="max-w-3xl">
      <nav className="text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          {t(lang, "breadcrumb.home")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{t(lang, "docs.breadcrumb")}</span>
      </nav>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{t(lang, "docs.title")}</h1>
      <p className="mt-3 leading-relaxed text-[var(--muted)]">
        {t(lang, "docs.lead")}
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">{t(lang, "docs.agent.title")}</h2>
        <p className="text-sm text-[var(--muted)]">{t(lang, "docs.agent.desc")}</p>
        <CopyCodeBlock
          lang={lang}
          text={t(lang, "docs.agent.commands")}
        />
        <p className="text-sm text-[var(--muted)]">{t(lang, "docs.agent.prompts.intro")}</p>
        <CopyCodeBlock
          lang={lang}
          text={t(lang, "docs.agent.prompts")}
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">{t(lang, "docs.install.title")}</h2>
        <CopyCodeBlock text="npm i -g @lightcity/anycli" lang={lang} />
        <p className="text-sm text-[var(--muted)]">{t(lang, "docs.install.desc")}</p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">{t(lang, "docs.human.title")}</h2>
        <p className="text-sm text-[var(--muted)]">{t(lang, "docs.human.desc")}</p>
        <CopyCodeBlock
          lang={lang}
          text={t(lang, "docs.human.commands")}
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">{t(lang, "docs.publish.title")}</h2>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/publish" className="font-medium text-[var(--accent)] hover:underline">
            {t(lang, "docs.publish.link")}
          </Link>
          {" "}
          {t(lang, "docs.publish.desc.p1")}
        </p>
      </section>
    </article>
  );
}

