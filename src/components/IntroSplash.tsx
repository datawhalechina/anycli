"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const SESSION_KEY = "anycli:splash:seen";
const SPLASH_SNIPPETS = [
  "anycli search lark-cli --json",
  "anycli install lark-cli --json",
  "anycli search gh --json",
];

export function IntroSplash() {
  // 保证 SSR 与首屏 hydration 一致：首渲染永远不显示，挂载后再决定是否播放
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [cmd, setCmd] = useState("");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const force =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("splash") === "1";
    const seen = sessionStorage.getItem(SESSION_KEY) === "1";
    if (force || !seen) {
      // 放到回调里，避免“effect 内同步 setState”触发 lint 规则
      window.requestAnimationFrame(() => setVisible(true));
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = window.setTimeout(() => {
      setClosing(true);
      window.setTimeout(() => setVisible(false), 520);
    }, 2600);
    return () => window.clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (prefersReducedMotion()) return;
    let cancelled = false;
    const typeMs = 36;
    const eraseMs = 18;
    const pauseTyped = 820;
    const pauseEmpty = 180;

    const run = async () => {
      while (!cancelled) {
        for (const full of SPLASH_SNIPPETS) {
          for (let k = 0; k <= full.length && !cancelled; k++) {
            setCmd(full.slice(0, k));
            await new Promise((r) => setTimeout(r, typeMs));
          }
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, pauseTyped));
          for (let k = full.length; k >= 0 && !cancelled; k--) {
            setCmd(full.slice(0, k));
            await new Promise((r) => setTimeout(r, eraseMs));
          }
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, pauseEmpty));
        }
      }
    };

    window.setTimeout(() => setCmd(""), 0);
    void run();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  if (!visible) return null;

  const displayCmd = prefersReducedMotion() ? SPLASH_SNIPPETS[0] : cmd;

  return (
    <div
      className={`intro-splash fixed inset-0 z-[60] ${closing ? "intro-splash-out" : ""}`}
      role="presentation"
      onClick={() => {
        setClosing(true);
        window.setTimeout(() => setVisible(false), 520);
      }}
    >
      <div className="intro-splash-bg" aria-hidden />
      <div className="intro-splash-scan" aria-hidden />

      <div className="intro-splash-inner">
        <div className="intro-splash-logoWrap" aria-hidden>
          <Image
            src="/logo.png"
            alt=""
            width={256}
            height={256}
            priority
            className="intro-splash-logo"
          />
          <div className="intro-splash-ripple" aria-hidden />
        </div>

        <div className="intro-splash-terminal" aria-hidden>
          <div className="intro-splash-prompt">
            <span className="intro-splash-dollar">$</span>
            <span className="intro-splash-cmd">{displayCmd}</span>
            <span className="intro-splash-cursor" />
          </div>
          <div className="intro-splash-tagline">Whale × Command Line · Agent-ready</div>
        </div>

        <button type="button" className="intro-splash-skip">
          点击跳过
        </button>
      </div>
    </div>
  );
}

