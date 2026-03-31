"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

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
  line1: string;
  line2: string;
  line1ClassName?: string;
  line2ClassName?: string;
  cursorClassName?: string;
  typeMs?: number;
  eraseMs?: number;
  pauseMs?: number;
  donePauseMs?: number;
};

export function HeroTypeTitle({
  line1,
  line2,
  line1ClassName = "",
  line2ClassName = "",
  cursorClassName = "",
  typeMs = 46,
  eraseMs = 26,
  pauseMs = 220,
  donePauseMs = 1600,
}: Props) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const [a, setA] = useState(reduceMotion ? line1 : "");
  const [b, setB] = useState(reduceMotion ? line2 : "");
  const [phase, setPhase] = useState<"a" | "pause" | "b" | "done" | "eraseB" | "eraseA">(
    reduceMotion ? "done" : "a",
  );

  const cursorAt = useMemo(() => {
    if (reduceMotion) return null;
    if (phase === "a") return "a";
    if (phase === "b") return "b";
    if (phase === "eraseB") return "b";
    if (phase === "eraseA") return "a";
    return null;
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        setA("");
        setB("");
        setPhase("a");

        for (let i = 1; i <= line1.length && !cancelled; i++) {
          setA(line1.slice(0, i));
          await new Promise((r) => setTimeout(r, typeMs));
        }
        if (cancelled) return;

        setPhase("pause");
        await new Promise((r) => setTimeout(r, pauseMs));
        if (cancelled) return;

        setPhase("b");
        for (let i = 1; i <= line2.length && !cancelled; i++) {
          setB(line2.slice(0, i));
          await new Promise((r) => setTimeout(r, typeMs));
        }
        if (cancelled) return;

        setPhase("done");
        await new Promise((r) => setTimeout(r, donePauseMs));
        if (cancelled) return;

        setPhase("eraseB");
        for (let i = line2.length; i >= 0 && !cancelled; i--) {
          setB(line2.slice(0, i));
          await new Promise((r) => setTimeout(r, eraseMs));
        }
        if (cancelled) return;

        setPhase("eraseA");
        for (let i = line1.length; i >= 0 && !cancelled; i--) {
          setA(line1.slice(0, i));
          await new Promise((r) => setTimeout(r, eraseMs));
        }
        if (cancelled) return;

        await new Promise((r) => setTimeout(r, Math.max(180, pauseMs)));
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [donePauseMs, eraseMs, line1, line2, pauseMs, reduceMotion, typeMs]);

  const cursor = cursorAt ? (
    <span
      className={`cli-cursor ml-1 inline-block h-[1.05em] w-[0.55ch] translate-y-[0.08em] rounded-sm bg-[var(--accent)] ${cursorClassName}`}
      aria-hidden
    />
  ) : null;

  return (
    <>
      <span className={line1ClassName}>
        {a}
        {cursorAt === "a" ? cursor : null}
      </span>
      <span className={line2ClassName}>
        {b}
        {cursorAt === "b" ? cursor : null}
      </span>
    </>
  );
}

