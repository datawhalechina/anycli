import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, normalizeLang, type Lang } from "./messages";

export async function getLangFromServerCookies(): Promise<Lang> {
  try {
    const c = await cookies();
    return normalizeLang(c.get(LANG_COOKIE)?.value);
  } catch {
    return DEFAULT_LANG;
  }
}

