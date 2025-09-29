export function Separator({ className = "", orientation = "horizontal" as const }: { className?: string; orientation?: "horizontal" | "vertical" }) {
  const base = orientation === "horizontal" ? "h-px w-full" : "h-full w-px"
  return <div className={[base, "bg-border", className].join(" ")} role="separator" aria-orientation={orientation} />
}


