/** 将 repository / homepage 规范为可比较的 GitHub HTTPS 基础 URL（无 .git、主机小写） */
export function canonicalGithubRepoUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const parsed = parseGithubOwnerRepo(url);
  if (!parsed) return null;
  return `https://github.com/${parsed.owner.toLowerCase()}/${parsed.repo.toLowerCase()}`;
}

export function parseGithubOwnerRepo(url: string): { owner: string; repo: string } | null {
  const trimmed = url.trim().replace(/\.git$/i, "");
  try {
    const u = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (host !== "github.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

type FetchStarsResult = { stars: number; ok: true } | { ok: false; status: number };

export function githubApiToken(): string | undefined {
  return (
    process.env.GITHUB_TOKEN?.trim() ||
    process.env.GH_TOKEN?.trim() ||
    process.env.GITHUB_API_TOKEN?.trim() ||
    undefined
  );
}

export async function fetchGithubRepoStars(owner: string, repo: string): Promise<FetchStarsResult> {
  const token = githubApiToken();
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  const data = (await res.json()) as { stargazers_count?: number };
  const stars = typeof data.stargazers_count === "number" ? data.stargazers_count : 0;
  return { ok: true, stars };
}

export type GithubSearchRepoItem = {
  full_name: string;
  html_url: string;
  stargazers_count: number;
};

type SearchResponse = { items?: GithubSearchRepoItem[] };

/** GitHub Search repositories（用于发现 skill 相关仓库并写入已存在目录条目的 star） */
export async function searchGithubRepositories(
  query: string,
  perPage: number,
): Promise<GithubSearchRepoItem[]> {
  const token = githubApiToken();
  const q = new URLSearchParams({
    q: query,
    sort: "stars",
    order: "desc",
    per_page: String(Math.min(100, Math.max(1, perPage))),
  });
  const res = await fetch(`https://api.github.com/search/repositories?${q}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub search ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as SearchResponse;
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map((item) => ({
    full_name: item.full_name,
    html_url: item.html_url,
    stargazers_count: Number(item.stargazers_count) || 0,
  }));
}
