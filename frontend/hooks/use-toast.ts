"use client"

import { toast as sonnerToast } from "sonner"

type ToastVariant = "default" | "destructive"

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  const toast = ({ title, description, variant }: ToastOptions) => {
    const message = title || description || ""
    const isError = variant === "destructive"
    sonnerToast[isError ? "error" : "success"](message, {
      description: title && description ? description : undefined,
    })
  }

  return { toast }
}


