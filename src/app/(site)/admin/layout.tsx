import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/review");
  }
  if (!session.user.isAdmin) {
    redirect("/");
  }
  return <>{children}</>;
}
