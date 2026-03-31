import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IntroSplash } from "@/components/IntroSplash";
import { getLangFromServerCookies } from "@/i18n/lang";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLangFromServerCookies();
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <IntroSplash />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="site-aurora absolute inset-0" />
        <div className="site-orb site-orb-1" />
        <div className="site-orb site-orb-2" />
      </div>
      <Header lang={lang} />
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">{children}</main>
      <Footer lang={lang} />
    </div>
  );
}
