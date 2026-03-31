/**
 * 从 GitHub 同步仓库 Star 到 CliTool.githubStars。
 *
 * 1) 默认：对库中每条记录的 repository 调用 GET /repos/{owner}/{repo}
 * 2) 可选 --discover：先按 GitHub Search 拉「skill」相关热门仓库，按 URL 写回已存在的目录行（适合 topic:skill 等）
 *
 * 建议配置 GITHUB_TOKEN / GH_TOKEN 提升速率（5000/h）。
 *
 * 用法：
 *   npm run stars:sync
 *   npm run stars:sync -- --discover
 *   npm run stars:sync -- --discover --search "topic:skill"
 */
import { loadEnvConfig } from "@next/env";
import { prisma } from "../src/lib/prisma";
import {
  canonicalGithubRepoUrl,
  fetchGithubRepoStars,
  githubApiToken,
  parseGithubOwnerRepo,
  searchGithubRepositories,
} from "../src/lib/github-stars";

loadEnvConfig(process.cwd());

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const argv = process.argv.slice(2);
  const discover = argv.includes("--discover");
  const si = argv.indexOf("--search");
  const searchQuery =
    si >= 0 && argv[si + 1] && !argv[si + 1].startsWith("-")
      ? argv[si + 1]
      : "topic:skill";
  const pi = argv.indexOf("--per-page");
  const perPage =
    pi >= 0 && argv[pi + 1] ? Math.min(100, Math.max(1, Number(argv[pi + 1]) || 30)) : 30;
  return { discover, searchQuery, perPage };
}

async function mergeFromSearch(query: string, perPage: number) {
  console.log(`[stars] GitHub Search: ${query} (per_page=${perPage})`);
  const items = await searchGithubRepositories(query, perPage);
  let updated = 0;
  for (const item of items) {
    const canon =
      canonicalGithubRepoUrl(item.html_url) ??
      canonicalGithubRepoUrl(`https://github.com/${item.full_name}`);
    if (!canon) continue;
    const r = await prisma.cliTool.updateMany({
      where: {
        OR: [{ repository: canon }, { repository: `${canon}.git` }, { homepage: canon }],
      },
      data: {
        githubStars: item.stargazers_count,
        githubStarsUpdatedAt: new Date(),
      },
    });
    updated += r.count;
  }
  console.log(`[stars] 搜索匹配并更新: ${updated} 条（与目录 repository/homepage 一致时）`);
}

async function syncFromDbRepositoryField() {
  const rows = await prisma.cliTool.findMany({
    select: { id: true, slug: true, repository: true },
  });
  const delay = githubApiToken() ? 100 : 900;
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const row of rows) {
    const p = row.repository ? parseGithubOwnerRepo(row.repository) : null;
    if (!p) {
      await prisma.cliTool.update({
        where: { id: row.id },
        data: { githubStars: 0, githubStarsUpdatedAt: new Date() },
      });
      skip++;
      continue;
    }

    const res = await fetchGithubRepoStars(p.owner, p.repo);
    if (!res.ok) {
      console.warn(`[stars] ${row.slug}: ${p.owner}/${p.repo} -> HTTP ${res.status}`);
      fail++;
      await sleep(delay);
      continue;
    }

    await prisma.cliTool.update({
      where: { id: row.id },
      data: { githubStars: res.stars, githubStarsUpdatedAt: new Date() },
    });
    ok++;
    await sleep(delay);
  }

  console.log(
    `[stars] 按 repository 字段同步完成: ${ok} 成功, ${fail} API 失败, ${skip} 非 GitHub/无仓库`,
  );
}

async function main() {
  const { discover, searchQuery, perPage } = parseArgs();

  if (discover) {
    await mergeFromSearch(searchQuery, perPage);
  }
  await syncFromDbRepositoryField();

  if (!githubApiToken()) {
    console.info("[stars] 提示: 配置 GITHUB_TOKEN 可避免匿名 403/限速。");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
