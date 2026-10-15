"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, type AuthFormState } from "@/features/user/auth-actions";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [signInState, signInAction, signingIn] = useActionState<AuthFormState, FormData>(signIn, {});
  const [signUpState, signUpAction, signingUp] = useActionState<AuthFormState, FormData>(signUp, {});
  const state = mode === "signin" ? signInState : signUpState;
  const pending = signingIn || signingUp;

  return (
    <>
      <div className="flex flex-col gap-1 border-t-2 border-foreground pt-3.5">
        <h1 className="m-0 text-[34px]">{mode === "signin" ? "ログイン" : "新規登録"}</h1>
        <p className="text-[13px] text-muted-foreground">
          お気に入り・読了を記録すると、あなたへのおすすめが表示されます。
        </p>
      </div>

      {/* ログイン / 新規登録の切り替え (Segmented と同じ見た目) */}
      <div role="tablist" aria-label="ログインか新規登録か" className="inline-flex self-start border border-border">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              "px-3 py-[7px] text-[13px] transition-colors [&+&]:border-l [&+&]:border-border",
              mode === m ? "bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            {m === "signin" ? "ログイン" : "新規登録"}
          </button>
        ))}
      </div>

      <form
        key={mode}
        action={mode === "signin" ? signInAction : signUpAction}
        className="flex flex-col gap-4"
        noValidate
      >
        <input type="hidden" name="next" value={next} />
        {mode === "signup" ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayName" className="text-xs text-muted-foreground">
              表示名 (任意)
            </Label>
            <Input id="displayName" name="displayName" autoComplete="nickname" maxLength={40} />
          </div>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs text-muted-foreground">
            メールアドレス
          </Label>
          <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-xs text-muted-foreground">
            パスワード {mode === "signup" ? "(8文字以上)" : ""}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={8}
          />
        </div>

        {state.error ? (
          <p role="alert" className="text-[13px] font-bold text-accent-text">
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p role="status" className="text-[13px] text-foreground">
            {state.message}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "送信中…" : mode === "signin" ? "ログイン" : "登録する"}
        </Button>
      </form>
    </>
  );
}
