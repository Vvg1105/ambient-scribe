"use client"

import * as React from "react"

type ButtonVariant = "default" | "outline" | "secondary"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none"
    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "h-8 px-3 py-1.5",
      md: "h-9 px-4 py-2",
      lg: "h-10 px-6 py-2.5",
    }
    const variants: Record<ButtonVariant, string> = {
      default: "bg-primary text-primary-foreground hover:opacity-90",
      outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
    }
    const classes = [base, sizes[size], variants[variant], className].join(" ")
    return <button ref={ref} className={classes} {...props} />
  },
)

Button.displayName = "Button"


