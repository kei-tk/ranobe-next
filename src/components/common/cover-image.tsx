import { ImageIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

// 書影 (3:4)。表紙が無いときは、面の色の上にアイコンを出す (docs/ui-design.md §2)。
// 版元ドットコムの画像は 600px 程度で十分小さいので、Vercel の画像最適化は通さない (無料枠を使い切らないため)
export function CoverImage({
  src,
  alt,
  sizes = "(min-width: 1240px) 200px, (min-width: 640px) 25vw, 45vw",
  priority = false,
  className,
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[3/4] w-full overflow-hidden bg-muted text-subtle-foreground", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center" aria-label={`${alt}の書影なし`} role="img">
          <ImageIcon className="size-6 opacity-60" aria-hidden />
        </div>
      )}
    </div>
  );
}
