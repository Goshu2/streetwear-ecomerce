import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatShortDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const generateOrderNumber = () => {
  const prefix = "ORD"
  const randomNumber = Math.floor(100000 + Math.random() * 900000) // 6-digit number
  return `${prefix}-${randomNumber}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
