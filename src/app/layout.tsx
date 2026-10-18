import type { Metadata, Viewport } from "next";
import { Archivo, Noto_Sans_JP } from "next/font/google";

import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

// 欧文は Archivo、和文は Noto Sans JP (デザインシステムの指定)
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });
// 和文は字数が多いので、先読みはしない (使う文字の分だけブラウザが取りに行く)
const notoSansJp = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto-sans-jp", preload: false });

export const metadata: Metadata = {
  title: { default: "ラノベ書庫", template: "%s | ラノベ書庫" },
  description: "ジャンルや雰囲気から、次に読むライトノベルを探す",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f2f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1918" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes が描画前に class="dark" を付けるので、そのずれの警告を抑える
    <html lang="ja" suppressHydrationWarning className={`${archivo.variable} ${notoSansJp.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 pt-8 pb-24 sm:px-6">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
