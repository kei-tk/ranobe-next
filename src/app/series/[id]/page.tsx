import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

// 作品詳細 (docs/ui-design.md §3.3)。中身はフェーズ3で実装する
export default function SeriesPage({ params }: PageProps<"/series/[id]">) {
  return (
    <div className="flex flex-col gap-12">
      <Button asChild variant="ghost" className="self-start px-1 text-foreground">
        <Link href="/search">
          <ArrowLeft />
          検索結果に戻る
        </Link>
      </Button>
      <Suspense fallback={null}>
        <SeriesId params={params} />
      </Suspense>
    </div>
  );
}

async function SeriesId({ params }: { params: PageProps<"/series/[id]">["params"] }) {
  const { id } = await params;
  return <p className="text-sm text-muted-foreground">(フェーズ3で、シリーズ {id} の詳細を表示します)</p>;
}
