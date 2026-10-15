"use server";

import "server-only";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type AuthFormState = { error?: string; message?: string; email?: string };

const credentials = z.object({
  email: z.email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
});

const signUpInput = credentials.extend({
  displayName: z.string().trim().max(40, "表示名は40文字以内にしてください").optional(),
});

// ログイン後の戻り先。サイトの中のパスだけを許す (外部の URL や //example.com への移動を防ぐ)
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // どちらが間違っているかは教えない (登録済みのメールアドレスを探られないように)
  if (error) return { error: "メールアドレスかパスワードが正しくありません", email };

  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpInput.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName") || undefined,
  });
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    // 022 の trigger (handle_new_user) が display_name を profiles に入れる
    options: { data: parsed.data.displayName ? { display_name: parsed.data.displayName } : undefined },
  });
  if (error) return { error: "登録できませんでした。時間をおいてもう一度お試しください", email };

  // メール確認が有効なプロジェクトでは、ここではまだセッションができない
  if (!data.session) {
    return { message: "確認メールを送りました。メールのリンクを開いてから、ログインしてください", email };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
