/** 读取 GitHub OAuth Client ID（多种常见环境变量名） */
function githubClientId(): string | undefined {
  const v =
    process.env.GITHUB_ID?.trim() ||
    process.env.AUTH_GITHUB_ID?.trim() ||
    process.env.GITHUB_CLIENT_ID?.trim();
  return v || undefined;
}

/** 读取 GitHub OAuth Client Secret */
function githubClientSecret(): string | undefined {
  const v =
    process.env.GITHUB_SECRET?.trim() ||
    process.env.AUTH_GITHUB_SECRET?.trim() ||
    process.env.GITHUB_CLIENT_SECRET?.trim();
  return v || undefined;
}

export function getGitHubOAuthCredentials(): { id: string; secret: string } | null {
  const id = githubClientId();
  const secret = githubClientSecret();
  if (!id || !secret) return null;
  return { id, secret };
}

export function isGitHubOAuthConfigured(): boolean {
  return getGitHubOAuthCredentials() !== null;
}
