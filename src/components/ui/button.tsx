import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

// Modernist に合わせて書き換え済み (docs/ui-design.md §2):
// 角丸・影なし / ラベルは左寄せ / 見出しと同じ 800 の太さ / 押せないときは 0.45
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-start border border-transparent font-extrabold whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // 文字を載せる朱色の面。hover / 押したときは暗い方へずらす (白い文字のコントラストを保つ)
        default: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        outline:
          "border-border bg-transparent text-foreground hover:bg-accent active:bg-[color-mix(in_srgb,var(--foreground)_14%,transparent)] aria-expanded:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_srgb,var(--secondary),var(--foreground)_7%)]",
        // 朱色の文字だけのボタン (ログアウト・条件をリセット など)
        ghost:
          "text-accent-text hover:bg-accent-tint active:bg-[color-mix(in_srgb,var(--brand)_18%,transparent)] aria-expanded:bg-accent-tint",
        destructive: "bg-destructive text-primary-foreground hover:opacity-90",
        link: "text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3.5 text-sm",
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 text-[13px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-4 text-sm",
        icon: "size-9 justify-center",
        "icon-xs": "size-6 justify-center [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 justify-center",
        "icon-lg": "size-10 justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
