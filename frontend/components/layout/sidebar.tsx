"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, FileText, Stethoscope, Shield, Mic, Activity } from "lucide-react"

const navigation = [
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Encounters", href: "/encounters", icon: FileText },
  { name: "SOAP Notes", href: "/soap", icon: Stethoscope },
  { name: "Antibiotics Rules", href: "/rules", icon: Shield },
  { name: "Live Transcription", href: "/transcription", icon: Mic },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Ambient Scribe</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">Clinical Documentation System</p>
      </div>
    </div>
  )
}