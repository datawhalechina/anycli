import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminEmailSet } from "@/lib/admin-emails";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  handle: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/),
  name: z.string().min(1).max(64).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "无效请求体" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "校验失败", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { email: emailInput, password, handle, name } = parsed.data;
  const email = emailInput.trim().toLowerCase();

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { handle }] },
  });
  if (exists) {
    return NextResponse.json({ error: "该邮箱或 handle 已被使用" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      handle,
      name: name ?? handle,
      isAdmin: adminEmailSet().has(email),
    },
  });

  return NextResponse.json({ ok: true });
}
