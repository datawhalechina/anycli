import Link from "next/link";
import { PublishForm } from "./ui";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";

export default async function PublishPage() {
  const lang = await getLangFromServerCookies();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">{t(lang, "publish.title")}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {t(lang, "publish.lead.p1")}
        <Link href="/dashboard" className="text-[var(--accent)] hover:underline">
          {t(lang, "dashboard.title")}
        </Link>{" "}
        {t(lang, "publish.lead.p2")}
      </p>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)]/40 px-4 py-3 text-sm text-[var(--foreground)]">
        <p className="font-medium text-[var(--accent)]">{t(lang, "publish.guide.title")}</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--muted)]">
          <li>
            {t(lang, "publish.guide.req")}
          </li>
          <li>{t(lang, "publish.guide.url")}</li>
          <li>
            {t(lang, "publish.guide.tagsCats")}
          </li>
          <li>
            {t(lang, "publish.guide.slugName")}
          </li>
        </ul>
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <PublishForm lang={lang} />
      </div>
    </div>
  );
}
