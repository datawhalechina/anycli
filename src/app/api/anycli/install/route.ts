import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { installCommand } from "@/lib/cli-json";
import { redisGetJson, redisSetJson } from "@/lib/redis";

type Body = {
  slug: string;
};

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "无效请求体" }, { status: 400 });
  }

  const b = (json ?? {}) as Partial<Body>;
  const slug = typeof b.slug === "string" ? b.slug.trim() : "";
  if (!slug) return NextResponse.json({ error: "slug 不能为空" }, { status: 400 });

  const cacheKey = `anycli:install:${slug}`;
  const cached = await redisGetJson<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const row = await prisma.cliTool.findFirst({
    where: { published: true, slug },
    select: {
      slug: true,
      name: true,
      installMethod: true,
      installPackage: true,
      binaryName: true,
    },
  });
  if (!row) return NextResponse.json({ error: "未找到" }, { status: 404 });

  const command = installCommand({
    installMethod: row.installMethod,
    installPackage: row.installPackage,
    binaryName: row.binaryName,
  });

  const out = {
    slug: row.slug,
    name: row.name,
    install: {
      method: row.installMethod === "script" ? "other" : row.installMethod,
      package: row.installPackage,
      binary: row.binaryName,
      command,
    },
  };

  await redisSetJson(cacheKey, out, 30);
  return NextResponse.json(out);
}

