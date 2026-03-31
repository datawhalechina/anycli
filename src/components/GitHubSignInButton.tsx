"use client";

import { signIn } from "next-auth/react";

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 98 96" aria-hidden>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
      />
    </svg>
  );
}

/**
 * @param configured 为 false 时按钮禁用（未在环境变量中配置 Client ID + Secret），仍可看见入口
 */
export function GitHubSignInButton({
  callbackUrl,
  label = "使用 GitHub 继续",
  configured = true,
}: {
  callbackUrl: string;
  label?: string;
  configured?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        disabled={!configured}
        onClick={() => configured && void signIn("github", { callbackUrl })}
        title={!configured ? "请配置 GITHUB_ID 与 GITHUB_SECRET" : undefined}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-[var(--elevated)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GitHubMark className="h-4 w-4 shrink-0" />
        {label}
      </button>
      {!configured ? (
        <p className="text-center text-xs leading-snug text-[var(--muted)]">
          服务端未检测到 GitHub OAuth：请在 <code className="font-mono text-[11px]">.env</code> 中设置{" "}
          <code className="font-mono text-[11px]">GITHUB_ID</code>（或 <code className="font-mono text-[11px]">GITHUB_CLIENT_ID</code>）与{" "}
          <code className="font-mono text-[11px]">GITHUB_SECRET</code>，须为 OAuth App 页面上的 Client ID 与 Client secret（通常 ID 类似
          <code className="mx-0.5 font-mono text-[11px]">Ov23li…</code>），不要填「Application name」。保存后请重启 dev 服务。
        </p>
      ) : null}
    </div>
  );
}
