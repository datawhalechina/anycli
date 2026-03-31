"use client";

import { CopyCliButton } from "@/app/(site)/clis/[slug]/ui";
import { t, type Lang } from "@/i18n/messages";

export function CopyCodeBlock({ text, label, lang }: { text: string; label?: string; lang: Lang }) {
  const finalLabel = label ?? t(lang, "common.copy");
  return (
    <div className="relative">
      <div className="absolute right-2 top-2">
        <CopyCliButton text={text} label={finalLabel} lang={lang} />
      </div>
      <pre className="overflow-x-auto rounded-xl bg-[var(--elevated)] p-4 font-mono text-sm">{text}</pre>
    </div>
  );
}

