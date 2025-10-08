"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

const SelectContext = React.createContext<SelectContextType | null>(null)

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        // Check if click is on dropdown content
        const dropdownContent = document.querySelector('[data-select-dropdown]')
        if (!dropdownContent || !dropdownContent.contains(target)) {
          setOpen(false)
        }
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, triggerRef }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className = "", children, ...props }: React.HTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")
  
  const { open, setOpen, triggerRef } = context
  
  return (
    <button 
      ref={triggerRef}
      type="button"
      className={["h-9 w-full justify-between rounded-md border px-3 text-sm flex items-center", className].join(" ")} 
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")
  
  const { value } = context
  
  return <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || placeholder || ""}</span>
}

export function SelectContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")
  
  const { open, triggerRef } = context
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })
  
  React.useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [open, triggerRef])
  
  if (!open) return null
  
  const content = (
    <div 
      data-select-dropdown
      className={["fixed z-[9999] rounded-md border bg-white dark:bg-gray-800 p-1 shadow-xl max-h-60 overflow-auto min-w-48", className].join(" ")}
      style={{
        top: position.top,
        left: position.left,
        width: Math.max(position.width, 192) // min-width of 12rem
      }}
      {...props}
    >
      {children}
    </div>
  )
  
  return typeof window !== 'undefined' ? createPortal(content, document.body) : null
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")
  
  const { value: selectedValue, onValueChange, setOpen } = context
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onValueChange?.(value)
    setOpen(false)
  }
  
  return (
    <div
      role="option"
      className="cursor-pointer rounded-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap"
      onClick={handleClick}
      onMouseDown={handleClick}
    >
      {children}
    </div>
  )
}


