import * as React from "react"

export function Command({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["rounded-md border bg-background", className].join(" ")} {...props} />
}

export function CommandInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={["w-full border-b px-3 py-2 text-sm outline-none", className].join(" ")} {...props} />
}

export function CommandList({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["max-h-60 overflow-auto", className].join(" ")} {...props} />
}

export function CommandEmpty({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["p-3 text-sm text-muted-foreground", className].join(" ")} {...props} />
}

export function CommandGroup({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["p-1", className].join(" ")} {...props} />
}

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: () => void
}

export function CommandItem({ className = "", onSelect, ...props }: CommandItemProps) {
  return (
    <div 
      className={["flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-accent", className].join(" ")} 
      onClick={onSelect}
      {...props} 
    />
  )
}


