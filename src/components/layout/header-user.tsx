import Link from "next/link";

import { Button } from "@/components/ui/button";
import { signOut } from "@/features/user/auth-actions";
import { getCurrentUser } from "@/lib/supabase/server";

// ログイン中: アバター (文字色の■にイニシャル) + 名前 + ログアウト / 未ログイン: ログイン
export async function HeaderUser() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Button asChild>
        <Link href="/auth">ログイン</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Link href="/account" className="flex items-center gap-2.5 text-foreground no-underline hover:text-accent-text">
        <span aria-hidden className="grid size-[30px] place-items-center bg-foreground text-[13px] font-extrabold text-background">
          {Array.from(user.displayName)[0]}
        </span>
        <span className="hidden text-sm font-bold sm:inline">{user.displayName}</span>
      </Link>
      <form action={signOut}>
        <Button type="submit" variant="ghost" className="px-1">
          ログアウト
        </Button>
      </form>
    </div>
  );
}
