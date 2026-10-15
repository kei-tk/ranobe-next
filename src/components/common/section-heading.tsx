import { cn } from "@/lib/utils";

// 上に 2px の太い線、左に見出し、右に小さな補足 (docs/ui-design.md §2)
export function SectionHeading({
  title,
  note,
  as: Tag = "h2",
  className,
}: {
  title: string;
  note?: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-foreground pt-3.5", className)}>
      <Tag className="m-0 text-[26px]">{title}</Tag>
      {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
    </div>
  );
}
