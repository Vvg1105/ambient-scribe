"use client"

import * as React from "react"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Select({ value, onValueChange, children }: SelectProps) {
  return <div data-select value={value} onChange={() => {}}>{children}</div>
}

export function SelectTrigger({ className = "", ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  return <button className={["h-9 w-full justify-between rounded-md border px-3 text-sm", className].join(" ")} {...props} />
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="text-muted-foreground">{placeholder || ""}</span>
}

export function SelectContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["mt-2 rounded-md border bg-popover p-1 shadow", className].join(" ")} {...props} />
}

export function SelectItem({ value, children, onClick }: { value: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      role="option"
      data-value={value}
      className="cursor-pointer rounded-sm px-2 py-1 text-sm hover:bg-accent"
      onClick={onClick}
    >
      {children}
    </div>
  )
}


