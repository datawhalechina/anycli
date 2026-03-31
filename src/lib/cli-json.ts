import type { CliTool } from "@prisma/client";

export type CliPublic = {
  slug: string;
  name: string;
  description: string;
  version: string | null;
  homepage: string | null;
  repository: string | null;
  license: string | null;
  categories: string[];
  tags: string[];
  docsUrls: string[];
  installMethod: string | null;
  installPackage: string | null;
  binaryName: string | null;
  runExample: string | null;
  agentHints: unknown | null;
  verified: boolean;
  createdAt: number;
  updatedAt: number;
  viewCount: number;
  /** GitHub 仓库 Star（由同步脚本更新；非 GitHub 为 0） */
  githubStars: number;
  owner: {
    handle: string;
    name: string | null;
    image: string | null;
  };
};

function parseJsonArray(s: string): string[] {
  try {
    const v = JSON.parse(s) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function parseAgentHints(s: string | null): unknown | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return null;
  }
}

function parseDocsUrls(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export function toPublicCli(
  row: CliTool & {
    author: { handle: string; name: string | null; image: string | null };
  },
): CliPublic {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    version: row.version,
    homepage: row.homepage,
    repository: row.repository,
    license: row.license,
    categories: parseJsonArray(row.categories),
    tags: parseJsonArray(row.tags),
    docsUrls: parseDocsUrls((row as unknown as { docsUrls?: string | null }).docsUrls),
    installMethod: row.installMethod,
    installPackage: row.installPackage,
    binaryName: row.binaryName,
    runExample: row.runExample,
    agentHints: parseAgentHints(row.agentHints),
    verified: row.verified,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    viewCount: row.viewCount,
    githubStars: row.githubStars,
    owner: {
      handle: row.author.handle,
      name: row.author.name,
      image: row.author.image,
    },
  };
}

export function installCommand(row: {
  installMethod: string | null;
  installPackage: string | null;
  binaryName: string | null;
}): string | null {
  const { installMethod, installPackage } = row;
  if (!installMethod || !installPackage) return null;
  switch (installMethod) {
    case "brew":
      return `brew install ${installPackage}`;
    case "npm":
      return `npm install -g ${installPackage}`;
    case "pnpm":
      return `pnpm add -g ${installPackage}`;
    case "cargo":
      return `cargo install ${installPackage}`;
    case "pip":
      return `pip install ${installPackage}`;
    case "go":
      return `go install ${installPackage}`;
    default:
      return `${installMethod} ${installPackage}`;
  }
}
