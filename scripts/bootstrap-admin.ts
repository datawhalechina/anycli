/**
 * 手动同步引导管理员（与 instrumentation 调用同一逻辑）。
 * 用法：npm run bootstrap:admin
 */
import { loadEnvConfig } from "@next/env";
import { runBootstrapAdmin } from "../src/lib/bootstrap-admin";
import { prisma } from "../src/lib/prisma";

loadEnvConfig(process.cwd());

async function main() {
  await runBootstrapAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
