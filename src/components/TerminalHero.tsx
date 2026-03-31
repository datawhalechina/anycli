"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { t, type Lang } from "@/i18n/messages";

const SNIPPETS = [
  "anycli search lark-cli --json",
  "anycli install lark-cli --json",
  "anycli search gh --json",
  "anycli search ripgrep --json",
];

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

type Props = {
  className?: string;
  /** 浏览页等紧凑布局：更小字号与更快打字节奏 */
  compact?: boolean;
  /** 与站点品牌色一致的浅色终端（首页等） */
  variant?: "default" | "brand";
  lang?: Lang;
};

export function TerminalHero({ className = "", compact = false, variant = "default", lang = "zh" }: Props) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [text, setText] = useState("");

  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    const typeMs = compact ? 38 : variant === "brand" ? 48 : 52;
    const eraseMs = compact ? 22 : variant === "brand" ? 28 : 32;
    const pauseTyped = compact ? 1600 : variant === "brand" ? 2600 : 2200;
    const pauseEmpty = compact ? 400 : 550;

    const run = async () => {
      while (!cancelled) {
        for (const full of SNIPPETS) {
          for (let k = 0; k <= full.length && !cancelled; k++) {
            setText(full.slice(0, k));
            await new Promise((r) => setTimeout(r, typeMs));
          }
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, pauseTyped));
          for (let k = full.length; k >= 0 && !cancelled; k--) {
            setText(full.slice(0, k));
            await new Promise((r) => setTimeout(r, eraseMs));
          }
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, pauseEmpty));
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [compact, reduceMotion, variant]);

  const displayCmd = reduceMotion ? SNIPPETS[0] : text;
  const brand = variant === "brand";

  const shell = brand
    ? `overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_90%,var(--palette-sky)_10%)] shadow-[0_24px_56px_-28px_var(--accent-glow)] backdrop-blur-md dark:bg-[color-mix(in_oklab,var(--surface)_86%,var(--palette-blue)_14%)] ${compact ? "" : "min-h-[min(220px,32svh)] sm:min-h-[min(280px,36svh)] lg:min-h-[300px]"}`
    : `cli-terminal cli-terminal-glow overflow-hidden rounded-2xl border border-[var(--terminal-border)] bg-[var(--terminal-bg)] shadow-[0_20px_50px_-20px_var(--terminal-shadow)]`;

  const titleBar = brand
    ? "flex h-10 shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--palette-sky)_24%,white_76%)] px-3 sm:h-11 sm:px-4 dark:bg-[color-mix(in_srgb,var(--palette-blue)_14%,var(--surface)_86%)]"
    : "flex h-9 shrink-0 items-center gap-2 border-b border-[var(--terminal-border)] bg-[var(--terminal-chrome)] px-3 sm:px-4";

  const bodyPad = brand
    ? compact
      ? "p-4 font-mono text-xs sm:text-sm"
      : "p-4 font-mono text-sm leading-relaxed sm:p-6 sm:text-lg"
    : `p-4 font-mono ${compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"} leading-relaxed`;

  const promptCls = brand ? "text-[var(--palette-blue)] dark:text-[var(--accent)]" : "text-[var(--terminal-prompt)]";
  const cmdCls = brand ? "text-[var(--foreground)]" : "text-[var(--terminal-command)]";
  const noteCls = brand ? "text-[var(--muted)]" : "text-[var(--terminal-dim)]";
  const noteBorder = brand ? "border-[var(--accent)]/45" : "border-[var(--terminal-prompt)]/35";
  const noteArrow = brand ? "text-[var(--palette-pink)] dark:text-[var(--accent)]" : "text-[var(--terminal-prompt)]/80";
  const cursorCls = brand
    ? "bg-gradient-to-b from-[var(--palette-blue)] to-[var(--palette-pink)]"
    : "bg-[var(--accent)]";

  return (
    <div className={`${shell} ${className}`}>
      <div className={titleBar}>
        {brand ? (
          <>
            <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--palette-pink)_55%,#ff5f57_45%)] shadow-sm" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--palette-cream)_50%,#febc2e_50%)] shadow-sm" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--palette-sky)_45%,#28c840_55%)] shadow-sm" aria-hidden />
          </>
        ) : (
          <>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/90 shadow-sm" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/90 shadow-sm" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/90 shadow-sm" aria-hidden />
          </>
        )}
        <span className={`ml-1 truncate font-mono text-[10px] font-medium tracking-wide ${brand ? "text-[var(--muted)]" : "text-[var(--terminal-dim)]"} sm:text-xs`}>
          anycli — zsh — 80×24
        </span>
      </div>
      <div className={bodyPad}>
        <div className="flex flex-wrap items-baseline gap-x-0">
          <span className={`shrink-0 font-semibold ${promptCls}`}>$</span>
          <span className={`min-w-0 break-all pl-2 ${cmdCls}`}>{displayCmd}</span>
          {!reduceMotion ? (
            <span
              className={`cli-cursor ml-0.5 inline-block h-[1.15em] w-[0.55ch] translate-y-[0.08em] rounded-sm ${cursorCls}`}
            />
          ) : null}
        </div>
        {!compact ? (
          <p className={`mt-4 border-l-2 ${noteBorder} pl-3 text-sm ${noteCls} sm:mt-5 ${brand ? "sm:text-[0.9375rem]" : "text-xs"}`}>
            <span className={noteArrow}>→</span> {t(lang, "terminal.note.agent")}
          </p>
        ) : (
          <p className={`mt-2 text-[10px] sm:text-xs ${noteCls}`}>
            <span className={promptCls}>●</span> {t(lang, "terminal.note.humanAgent")}
          </p>
        )}
      </div>
    </div>
  );
}
