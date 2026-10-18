"use client";

import { useState } from "react";

import { CoverImage } from "@/components/common/cover-image";
import { Button } from "@/components/ui/button";
import type { Volume } from "@/features/series/types";
import { formatLongDate } from "@/lib/format";
import { SHOW_COVERS } from "@/lib/variant";

const INITIAL = 10;

// 巻一覧 (巻 | [書影] | タイトル | 発売日。書影の列は書影ありの版だけ)。10巻を超えたら残りは折りたたむ。行を押すと版元ドットコムのページを開く
export function VolumeTable({ volumes }: { volumes: Volume[] }) {
  const [open, setOpen] = useState(false);
  const rows = open ? volumes : volumes.slice(0, INITIAL);
  const grid = SHOW_COVERS
    ? "grid grid-cols-[64px_minmax(0,1fr)_110px] gap-5 sm:grid-cols-[64px_40px_minmax(0,1fr)_110px]"
    : "grid grid-cols-[64px_minmax(0,1fr)_110px] gap-5";

  return (
    <div className="flex flex-col">
      <div
        className={`${grid} border-t-2 border-b border-border py-2 text-[11px] tracking-[.06em] text-muted-foreground`}
        aria-hidden
      >
        <span>巻</span>
        {SHOW_COVERS ? <span className="hidden sm:block">書影</span> : null}
        <span>タイトル</span>
        <span>発売日</span>
      </div>
      <ol className="m-0 list-none p-0">
        {rows.map((v) => (
          <li key={v.isbn}>
            <a
              href={`https://www.hanmoto.com/bd/isbn/${v.isbn}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${grid} items-baseline border-b border-line py-3 text-foreground no-underline hover:bg-accent`}
            >
              <span className="text-xl font-extrabold">
                {v.volume_number != null ? `${v.volume_number}${v.volume_number_sub ? ` ${v.volume_number_sub}` : ""}` : "—"}
              </span>
              {SHOW_COVERS ? (
                <span className="hidden sm:block">
                  <CoverImage src={v.cover_image_url} alt={v.title ?? ""} sizes="40px" />
                </span>
              ) : null}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] leading-[1.4] font-bold">{v.title}</span>
                {v.hasSpecialEdition ? <span className="text-[11px] text-accent-text">特装版あり</span> : null}
              </span>
              <span className="text-[13px]">{formatLongDate(v.published_date)}</span>
            </a>
          </li>
        ))}
      </ol>
      {volumes.length > INITIAL ? (
        <Button variant="ghost" className="mt-2 self-start px-1" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "折りたたむ" : `すべての巻を表示 (全${volumes.length}巻)`}
        </Button>
      ) : null}
    </div>
  );
}
