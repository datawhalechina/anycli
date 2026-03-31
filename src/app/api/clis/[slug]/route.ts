import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cliWriteBodySchema } from "@/lib/cli-write-schema";
import { buildAgentHints } from "@/lib/agent-hints";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ slug: string }> };

async function getOwnedCli(slug: string, userId: string) {
  const row = await prisma.cliTool.findUnique({ where: { slug } });
  if (!row || row.authorId !== userId) return null;
  return row;
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const existing = await getOwnedCli(slug, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "未找到或无权修改" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "无效请求体" }, { status: 400 });
  }

  const parsed = cliWriteBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "校验失败", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const installMethod =
    d.installMethod === "other" ? "script" : (d.installMethod ?? null);

  const agentHints = buildAgentHints({
    name: d.name,
    slug: existing.slug,
    description: d.description,
    installMethod,
    installPackage: d.installPackage ?? null,
    binaryName: d.binaryName ?? null,
    runExample: d.runExample ?? null,
    docsUrls: [d.docsUrl],
  });

  await prisma.cliTool.update({
    where: { id: existing.id },
    data: {
      name: d.name,
      description: d.description,
      version: d.version ?? null,
      homepage: d.homepage || null,
      repository: d.repository || null,
      license: d.license ?? null,
      categories: JSON.stringify(d.categories ?? []),
      tags: JSON.stringify(d.tags ?? []),
      docsUrls: JSON.stringify([d.docsUrl]),
      installMethod,
      installPackage: d.installPackage ?? null,
      binaryName: d.binaryName ?? null,
      runExample: d.runExample ?? null,
      agentHints: JSON.stringify(agentHints),
    },
  });

  return NextResponse.json({ slug: existing.slug });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const existing = await getOwnedCli(slug, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "未找到或无权删除" }, { status: 404 });
  }

  await prisma.cliTool.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
