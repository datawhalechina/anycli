"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function approveCli(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    redirect("/");
  }

  const id = formData.get("cliId");
  if (typeof id !== "string" || !id) {
    redirect("/admin/review");
  }

  const featured = formData.get("featured") === "on";
  const cli = await prisma.cliTool.findUnique({ where: { id } });
  if (!cli || cli.published) {
    redirect("/admin/review");
  }

  await prisma.cliTool.update({
    where: { id },
    data: { published: true, verified: featured },
  });

  revalidatePath("/admin/review");
  revalidatePath("/clis");
  revalidatePath("/");
  revalidatePath(`/clis/${cli.slug}`);
  redirect("/admin/review");
}
