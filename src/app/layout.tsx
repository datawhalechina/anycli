import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Providers } from "@/components/providers";
import { LANG_COOKIE, normalizeLang } from "@/i18n/messages";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AnyCLI — 面向 Agent 的 CLI 原生平台",
    template: "%s · AnyCLI",
  },
  description:
    "统一的 CLI 注册与索引平台：人类与 AI Agent 共同发现、运行并集成命令行工具。将 CLI 转化为结构化、可被 Agent 调用的能力单元。",
  icons: {
    icon: { url: "/logo.png", type: "image/png" },
    apple: { url: "/logo.png", type: "image/png" },
    shortcut: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const c = await cookies();
  const lang = normalizeLang(c.get(LANG_COOKIE)?.value);
  return (
    <html lang={lang === "en" ? "en" : "zh-CN"} className="h-full antialiased">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
