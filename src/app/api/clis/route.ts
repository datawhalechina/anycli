import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCliSchema } from "@/lib/cli-write-schema";
import { buildAgentHints } from "@/lib/agent-hints";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "无效请求体" }, { status: 400 });
  }

  const parsed = createCliSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "校验失败", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const exists = await prisma.cliTool.findUnique({ where: { slug: d.slug } });
  if (exists) {
    return NextResponse.json({ error: "slug 已被占用" }, { status: 409 });
  }

  const installMethod =
    d.installMethod === "other" ? "script" : (d.installMethod ?? null);

  const agentHints = buildAgentHints({
    name: d.name,
    slug: d.slug,
    description: d.description,
    installMethod,
    installPackage: d.installPackage ?? null,
    binaryName: d.binaryName ?? null,
    runExample: d.runExample ?? null,
    docsUrls: [d.docsUrl],
  });

  const row = await prisma.cliTool.create({
    data: {
      slug: d.slug,
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
      verified: false,
      published: false,
      authorId: session.user.id,
    },
  });

  return NextResponse.json({ slug: row.slug });
}
