import Link from "next/link";
import { isGitHubOAuthConfigured } from "@/lib/oauth-config";
import { LoginForm } from "./ui";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";

type Props = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const lang = await getLangFromServerCookies();
  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl && sp.callbackUrl.startsWith("/") ? sp.callbackUrl : "/dashboard";
  const githubConfigured = isGitHubOAuthConfigured();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">{t(lang, "login.title")}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {t(lang, "login.noAccount")}{" "}
        <Link href="/register" className="font-medium text-[var(--accent)] hover:underline">
          {t(lang, "login.goRegister")}
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <LoginForm callbackUrl={callbackUrl} githubConfigured={githubConfigured} lang={lang} />
      </div>
    </div>
  );
}
