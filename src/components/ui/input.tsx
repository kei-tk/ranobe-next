import * as React from "react"
import { cn } from "cn"

// Modernist の .input に合わせて書き換え済み: 面の色の背景 / 14px / 高さ 36px / フォーカスで枠を朱色に
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 border border-input bg-card px-2.5 py-1.5 text-sm text-foreground caret-brand transition-colors outline-none placeholder:text-muted-foreground hover:border-[color-mix(in_srgb,var(--foreground)_45%,transparent)] focus-visible:border-brand focus-visible:outline-offset-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-destructive file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
