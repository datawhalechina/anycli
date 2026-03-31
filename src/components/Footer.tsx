import Image from "next/image";
import Link from "next/link";
import type { Lang } from "@/i18n/messages";
import { t } from "@/i18n/messages";

export function Footer({ lang = "zh" }: { lang?: Lang }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-auto border-t border-[var(--border)]/50 bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] py-10 backdrop-blur-md dark:border-[var(--border)]/35">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" aria-hidden />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="flex items-center gap-3 font-semibold text-[var(--foreground)]">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] ring-1 ring-[var(--border)] shadow-sm backdrop-blur-md sm:h-16 sm:w-16">
              <Image
                src="/logo.png"
                alt=""
                width={128}
                height={128}
                className="h-11 w-11 object-contain drop-shadow-[0_10px_18px_color-mix(in_srgb,var(--accent)_16%,transparent)] sm:h-12 sm:w-12"
                sizes="(max-width: 640px) 48px, 52px"
                aria-hidden
              />
            </span>
            <span>
              Any<span className="text-[var(--accent)]">CLI</span>
            </span>
          </p>
          <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">
            {t(lang, "footer.tagline")}
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <Link href="/docs" className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]">
            {t(lang, "nav.docs")}
          </Link>
          <Link href="/clis" className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]">
            {t(lang, "nav.explore")}
          </Link>
          <Link href="/about" className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]">
            {t(lang, "nav.about")}
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-4 text-center text-xs text-[var(--muted)] sm:px-6">
        {t(lang, "footer.copyright").replace("{year}", String(year))}
      </p>
    </footer>
  );
}
