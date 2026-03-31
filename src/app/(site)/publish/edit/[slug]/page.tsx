import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";
import { PublishForm } from "../../ui";

function jsonStringArrayToList(s: string): string[] {
  try {
    const v = JSON.parse(s) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string")
      .map((x) => x.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ slug: string }> };

export default async function EditCliPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) notFound();
  const lang = await getLangFromServerCookies();

  const { slug } = await params;
  const row = await prisma.cliTool.findUnique({ where: { slug } });
  if (!row || row.authorId !== session.user.id) notFound();

  const installMethod = row.installMethod === "script" ? "other" : row.installMethod ?? "";
  const docsUrlList = jsonStringArrayToList((row as unknown as { docsUrls?: string | null }).docsUrls ?? "[]");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">{t(lang, "publish.edit.title")}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {t(lang, "publish.edit.lead")}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        <Link href="/dashboard" className="text-[var(--accent)] hover:underline">
          {t(lang, "publish.edit.backDashboard")}
        </Link>
        {" · "}
        <Link href={`/clis/${row.slug}`} className="text-[var(--accent)] hover:underline">
          {t(lang, "publish.edit.viewDetail")}
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <PublishForm
          key={row.slug}
          mode="edit"
          slug={row.slug}
          lang={lang}
          initial={{
            name: row.name,
            description: row.description,
            version: row.version ?? "",
            homepage: row.homepage ?? "",
            repository: row.repository ?? "",
            license: row.license ?? "",
            tags: jsonStringArrayToList(row.tags),
            categories: jsonStringArrayToList(row.categories),
            docsUrl: docsUrlList[0] ?? "",
            installMethod,
            installPackage: row.installPackage ?? "",
            binaryName: row.binaryName ?? "",
            runExample: row.runExample ?? "",
          }}
        />
      </div>
    </div>
  );
}
