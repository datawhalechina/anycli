import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toPublicCli } from "@/lib/cli-json";

type Props = { params: Promise<{ handle: string }> };

export default async function UserPublicPage({ params }: Props) {
  const { handle } = await params;
  const user = await prisma.user.findUnique({
    where: { handle },
    include: {
      clis: {
        where: { published: true },
        orderBy: { updatedAt: "desc" },
        include: { author: { select: { handle: true, name: true, image: true } } },
      },
    },
  });
  if (!user) notFound();

  return (
    <div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">@{user.handle}</h1>
        {user.name ? <p className="mt-1 text-[var(--muted)]">{user.name}</p> : null}
        {user.bio ? <p className="mt-4 text-sm leading-relaxed text-[var(--foreground)]">{user.bio}</p> : null}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-[var(--foreground)]">发布的 CLI</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {user.clis.length === 0 ? (
          <li className="text-sm text-[var(--muted)]">暂无公开工具。</li>
        ) : (
          user.clis.map((row) => {
            const c = toPublicCli(row);
            return (
              <li key={c.slug}>
                <Link
                  href={`/clis/${c.slug}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]/35"
                >
                  <span className="font-medium text-[var(--foreground)]">{c.name}</span>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{c.description}</p>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
