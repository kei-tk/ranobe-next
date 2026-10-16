"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setFavorite, setRead, type LibraryStatus } from "@/features/user/library";

// 「お気に入りに追加」「読み終わった」(docs/ui-design.md §3.3)。押したらすぐ表示を変え、保存に失敗したら戻す
export function LibraryActions({ seriesId, initial }: { seriesId: string; initial: LibraryStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setOptimistic] = useOptimistic(initial);

  function toggle(kind: "favorite" | "read") {
    if (!status.loggedIn) {
      router.push(`/auth?next=${encodeURIComponent(`/series/${seriesId}`)}`);
      return;
    }
    const next = !status[kind];
    startTransition(async () => {
      setOptimistic({ ...status, [kind]: next });
      try {
        await (kind === "favorite" ? setFavorite(seriesId, next) : setRead(seriesId, next));
        router.refresh();
      } catch {
        toast.error("保存できませんでした。時間をおいてもう一度お試しください");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={status.favorite ? "outline" : "default"}
        aria-pressed={status.favorite}
        disabled={pending}
        onClick={() => toggle("favorite")}
      >
        {status.favorite ? "お気に入り済み" : "お気に入りに追加"}
      </Button>
      <Button variant="outline" aria-pressed={status.read} disabled={pending} onClick={() => toggle("read")}>
        {status.read ? "読了済み" : "読み終わった"}
      </Button>
    </div>
  );
}
