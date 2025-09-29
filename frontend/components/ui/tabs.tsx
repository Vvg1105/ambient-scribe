"use client"

import * as React from "react"

interface TabsContextValue {
  value: string | undefined
  setValue: (v: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({ value, defaultValue, onValueChange, className = "", children }: {
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue)
  const current = value !== undefined ? value : internal
  const setValue = (v: string) => {
    setInternal(v)
    onValueChange?.(v)
  }
  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div className={["w-full", className].join(" ")}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className].join(" ")} {...props} />
}

export function TabsTrigger({ value, className = "", children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)
  const selected = ctx?.value === value
  return (
    <button
      onClick={() => ctx?.setValue(value)}
      className={[
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none",
        selected ? "bg-background text-foreground shadow" : "text-muted-foreground",
        className,
      ].join(" ")}
      data-state={selected ? "active" : "inactive"}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className = "", children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)
  const selected = ctx?.value === value
  if (!selected) return null
  return <div className={["mt-2", className].join(" ")}>{children}</div>
}


