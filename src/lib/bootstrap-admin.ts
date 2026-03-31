import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function normalizeEmail(s: string): string {
  return s.trim().toLowerCase();
}

function handleFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "admin";
  let h = local
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (h.length < 2) h = "admin";
  if (!/^[a-z0-9]/.test(h)) h = `a-${h}`;
  if (!/[a-z0-9]$/.test(h)) h = `${h}x`;
  return h.slice(0, 32);
}

async function uniqueHandle(base: string): Promise<string> {
  let candidate = base.slice(0, 32);
  let n = 0;
  while (await prisma.user.findUnique({ where: { handle: candidate } })) {
    n += 1;
    candidate = `${base.slice(0, 24)}-${n}`.slice(0, 32);
  }
  return candidate;
}

/**
 * 若配置了 BOOTSTRAP_ADMIN_EMAIL + BOOTSTRAP_ADMIN_PASSWORD：
 * - 用户不存在：创建账号并 isAdmin=true
 * - 已存在：默认仅保证 isAdmin=true；若 BOOTSTRAP_ADMIN_SYNC_PASSWORD=1 或无密码则写入新密码
 *
 * 由 instrumentation 在 Node 进程启动时调用；也可用 `npm run bootstrap:admin` 手动执行。
 */
export async function runBootstrapAdmin(): Promise<void> {
  const emailRaw = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!emailRaw || !password) return;

  const email = normalizeEmail(emailRaw);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.warn("[anycli] BOOTSTRAP_ADMIN_EMAIL 无效，已跳过引导管理员");
    return;
  }
  if (password.length < 8) {
    console.warn("[anycli] BOOTSTRAP_ADMIN_PASSWORD 至少 8 位，已跳过引导管理员");
    return;
  }

  const handleEnv = process.env.BOOTSTRAP_ADMIN_HANDLE?.trim().toLowerCase();
  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "管理员";
  const syncPassword =
    process.env.BOOTSTRAP_ADMIN_SYNC_PASSWORD === "1" ||
    process.env.BOOTSTRAP_ADMIN_SYNC_PASSWORD === "true";

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    const passwordHash = await bcrypt.hash(password, 12);

    if (existing) {
      const needPassword = syncPassword || !existing.password;
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          isAdmin: true,
          ...(needPassword ? { password: passwordHash } : {}),
        },
      });
      console.info(
        `[anycli] 引导管理员已更新: ${email}${needPassword ? "（已同步密码）" : "（密码未改，设 BOOTSTRAP_ADMIN_SYNC_PASSWORD=1 可重置）"}`,
      );
      return;
    }

    let handle: string;
    if (handleEnv && handleEnv.length >= 2 && HANDLE_RE.test(handleEnv)) {
      handle = await uniqueHandle(handleEnv);
    } else {
      handle = await uniqueHandle(handleFromEmail(email));
    }

    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        handle,
        name,
        isAdmin: true,
      },
    });
    console.info(`[anycli] 引导管理员已创建: ${email} · @${handle}`);
  } catch (e) {
    console.warn(
      "[anycli] 引导管理员失败（可能尚未连库或迁移未完成）：",
      e instanceof Error ? e.message : e,
    );
  }
}
