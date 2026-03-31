import Link from "next/link";
import { isGitHubOAuthConfigured } from "@/lib/oauth-config";
import { RegisterForm } from "./ui";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";

export default async function RegisterPage() {
  const lang = await getLangFromServerCookies();
  const githubConfigured = isGitHubOAuthConfigured();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">{t(lang, "register.title")}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {t(lang, "register.hasAccount")}{" "}
        <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
          {t(lang, "register.goLogin")}
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <RegisterForm githubConfigured={githubConfigured} lang={lang} />
      </div>
    </div>
  );
}
