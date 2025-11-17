import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-lg hover-lift hover:brightness-105 transition-optimized",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 hover:shadow-lg hover-lift hover:brightness-105 transition-optimized focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover-lift hover:brightness-105 transition-optimized dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 hover:shadow-lg hover-lift hover:brightness-105 transition-optimized",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover-lift hover:brightness-105 transition-optimized dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline hover-lift hover:brightness-105 transition-optimized",
        brand:
          "bg-brand-gradient text-white shadow-lg hover:shadow-xl hover-lift hover:brightness-110",
        "brand-outline":
          "border border-brand-gradient bg-transparent text-foreground hover:bg-brand-gradient hover:text-gray-900 hover:shadow-lg hover-lift hover:brightness-105 transition-optimized",
        "brand-ghost":
          "text-brand-rose hover:bg-brand-rose hover:text-white hover:brightness-105 hover-lift transition-optimized",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        xl: "h-12 rounded-md px-8 text-base",
        icon: "size-9",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
