import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals = 0) {
  const [int, frac] = Math.abs(value).toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${value < 0 ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
}

export function formatCurrency(value: number) {
  const formatted = formatNumber(Math.abs(value), Number.isInteger(value) ? 0 : 2);
  return `${value < 0 ? "-" : ""}R${formatted}`;
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function uid(prefix = "") {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

export const siteConfig = {
  name: "Naykama AI",
  tagline: "Hire Your First AI Employee.",
  description:
    "Naykama AI answers customers, books appointments, creates invoices, manages inventory, and works 24/7.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
