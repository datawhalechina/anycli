import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getLangFromServerCookies } from "@/i18n/lang";
import { t } from "@/i18n/messages";
import { ProfileCard } from "./ui";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const lang = await getLangFromServerCookies();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">{t(lang, "settings.title")}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{t(lang, "settings.subtitle")}</p>

      <div className="mt-10 flex flex-col gap-8">
        <ProfileCard user={{ name: user.name, bio: user.bio, email: user.email, handle: user.handle }} />
      </div>
    </div>
  );
}
