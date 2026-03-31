import { prisma } from "@/lib/prisma";

/**
 * 记录 CLI 详情页 PV：
 * - 直接写入 MySQL（不经过 Redis）
 *
 * 说明：之前的 Redis 批量回写方案虽然能减轻写库压力，但会引入部署/运维复杂度，
 * 且在某些环境下会导致统计延迟与一致性困扰。PV 本身容忍一定写放大，这里优先简化链路。
 */
export async function recordCliView(cliId: string) {
  try {
    // 使用原生 SQL，避免 Prisma Client 类型/生成不一致导致的构建/诊断波动
    await prisma.$executeRaw`UPDATE CliTool SET viewCount = viewCount + 1 WHERE id = ${cliId}`;
  } catch {
    // PV 失败不阻塞页面渲染
  }
}

