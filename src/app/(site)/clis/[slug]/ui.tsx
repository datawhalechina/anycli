"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { t, type Lang } from "@/i18n/messages";

export function CopyCliButton({ text, label, lang }: { text: string; label: string; lang: Lang }) {
  const [done, setDone] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]"
    >
      {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {done ? t(lang, "common.copied") : label}
    </button>
  );
}
