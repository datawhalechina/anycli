export type Lang = "zh" | "en";

export const DEFAULT_LANG: Lang = "zh";
export const LANG_COOKIE = "anycli_lang";

export function normalizeLang(input: string | null | undefined): Lang {
  return input === "en" ? "en" : "zh";
}

import zh from "./zh.json";
import en from "./en.json";

export const MESSAGES: Record<Lang, Record<string, string>> = {
  zh: zh as Record<string, string>,
  en: en as Record<string, string>,
};

export function t(lang: Lang, key: string) {
  return MESSAGES[lang][key] ?? MESSAGES[DEFAULT_LANG][key] ?? key;
}

