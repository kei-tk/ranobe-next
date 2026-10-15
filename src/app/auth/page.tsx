import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthForm } from "@/app/auth/auth-form";

export const metadata: Metadata = { title: "ログイン" };

// ログイン / 新規登録 (デザインにないので、同じトークンと部品で新しく描いた。docs/ui-design.md §4)
export default function AuthPage({ searchParams }: PageProps<"/auth">) {
  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-col gap-6">
      <Suspense fallback={<AuthForm next="/" />}>
        <AuthFormWithNext searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AuthFormWithNext({ searchParams }: { searchParams: PageProps<"/auth">["searchParams"] }) {
  const { next } = await searchParams;
  return <AuthForm next={typeof next === "string" ? next : "/"} />;
}
