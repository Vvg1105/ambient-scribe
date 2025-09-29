"use client"

import * as React from "react"

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

export function Popover({ open: controlledOpen, defaultOpen, onOpenChange, children }: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = React.useState<boolean>(!!defaultOpen)
  const open = controlledOpen ?? internalOpen
  const setOpen = (o: boolean) => {
    setInternalOpen(o)
    onOpenChange?.(o)
  }
  return <PopoverContext.Provider value={{ open, setOpen }}>{children}</PopoverContext.Provider>
}

export function PopoverTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(PopoverContext)!
  const props = { onClick: () => ctx.setOpen(!ctx.open) }
  return asChild ? React.cloneElement(children, props) : <button {...props}>{children}</button>
}

export function PopoverContent({ className = "", align = "center" as const, children }: { className?: string; align?: "start" | "center" | "end"; children: React.ReactNode }) {
  const ctx = React.useContext(PopoverContext)!
  if (!ctx.open) return null
  return (
    <div className={["z-50 mt-2 w-64 rounded-md border bg-popover p-2 shadow-md", className].join(" ")} data-align={align}>
      {children}
    </div>
  )
}


