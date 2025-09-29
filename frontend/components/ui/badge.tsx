import * as React from "react"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

export function Badge({ className = "", variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input",
    destructive: "bg-destructive text-destructive-foreground",
  }
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
  return <span className={[base, variants[variant], className].join(" ")} {...props} />
}


