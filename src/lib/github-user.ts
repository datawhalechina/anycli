import { prisma } from "@/lib/prisma";
import { adminEmailSet } from "@/lib/admin-emails";

type GitHubProfile = {
  id: number | string;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

function githubPrimaryEmail(profile: GitHubProfile): string {
  const id = Number(profile.id);
  const login = profile.login;
  const raw = profile.email?.trim();
  if (raw) return raw.toLowerCase();
  return `${id}+${login}@users.noreply.github.com`.toLowerCase();
}

/** 将 GitHub login 转为符合本站 handle 规则的基础串（仍需做唯一化） */
function handleBaseFromGithubLogin(login: string): string {
  let h = login.toLowerCase().replace(/_/g, "-").replace(/[^a-z0-9-]/g, "");
  h = h.replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (h.length < 2) {
    const alnum = login.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
    h = `gh${alnum}`.slice(0, 32);
  }
  if (!/^[a-z0-9]/.test(h)) h = `gh${h}`;
  if (!/[a-z0-9]$/.test(h)) h = `${h}x`;
  return h.slice(0, 32);
}

async function ensureUniqueHandle(base: string): Promise<string> {
  let candidate = base;
  let n = 0;
  while (await prisma.user.findUnique({ where: { handle: candidate } })) {
    n += 1;
    candidate = `${base.slice(0, 24)}-${n}`;
    if (candidate.length > 32) candidate = candidate.slice(0, 32);
  }
  return candidate;
}

export async function getOrCreateGitHubUser(profile: GitHubProfile) {
  const email = githubPrimaryEmail(profile);
  const image = profile.avatar_url ?? null;
  const name = profile.name?.trim() || profile.login;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const data: { image?: string | null; name?: string | null } = {};
    if (image !== null && image !== existing.image) data.image = image;
    if (name && name !== existing.name) data.name = name;
    if (Object.keys(data).length) {
      return prisma.user.update({ where: { id: existing.id }, data });
    }
    return existing;
  }

  const baseHandle = handleBaseFromGithubLogin(profile.login);
  const handle = await ensureUniqueHandle(baseHandle);

  return prisma.user.create({
    data: {
      email,
      password: null,
      handle,
      name,
      image,
      isAdmin: adminEmailSet().has(email),
    },
  });
}
