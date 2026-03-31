/**
 * Node 进程启动时执行（dev / start）。Edge 运行时跳过。
 * @see https://nextjs.org/docs/app/guides/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { runBootstrapAdmin } = await import("@/lib/bootstrap-admin");
  await runBootstrapAdmin();
}
