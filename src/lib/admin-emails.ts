/** 逗号/空格/分号分隔的管理员邮箱（小写比较） */
export function adminEmailSet(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(/[,;\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}
