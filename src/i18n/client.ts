"use client";

import { useMemo } from "react";
import { LANG_COOKIE, normalizeLang, t, type Lang } from "./messages";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replaceAll("-", "\\-")}=([^;]*)`));
  return m ? decodeURIComponent(m[1]!) : null;
}

export function getLangFromClientCookies(): Lang {
  return normalizeLang(readCookie(LANG_COOKIE));
}

export function useLang(): Lang {
  // cookie 变化会触发 reload；这里不需要订阅式更新
  return useMemo(() => getLangFromClientCookies(), []);
}

export function useT() {
  const lang = useLang();
  return useMemo(() => ({ lang, t: (key: string) => t(lang, key) }), [lang]);
}

