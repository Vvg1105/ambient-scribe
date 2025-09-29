"use client"

import * as React from "react"

interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

export function Dialog({ open: controlledOpen, defaultOpen, onOpenChange, children }: {
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
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>
}

export function DialogContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)!
  if (!ctx.open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => ctx.setOpen(false)} />
      <div className={["relative z-10 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg", className].join(" ")}>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["flex flex-col space-y-1.5", className].join(" ")} {...props} />
}

export function DialogFooter({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["flex justify-end gap-2 pt-4", className].join(" ")} {...props} />
}

export function DialogTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={["text-lg font-semibold", className].join(" ")} {...props} />
}

export function DialogDescription({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={["text-sm text-muted-foreground", className].join(" ")} {...props} />
}


