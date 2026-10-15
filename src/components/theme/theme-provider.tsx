"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// 選んだテーマは localStorage に保存する (DB には保存しない。ログインしていなくても使えるように)
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
