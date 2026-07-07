import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function money(n: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Math.round(Number(n) || 0)
  );
}

export const CATEGORY_COLORS = {
  Vases: "#C1622B",
  Bowls: "#6E8354",
  Plates: "#B8863A",
  Cups: "#BBA98F",
  Mugs: "#93481D",
  "Decorative Items": "#465634",
  "Handmade Art": "#9C3B2A",
  "Custom Orders": "#7A5C3E",
} as const;

export const CATEGORIES = Object.keys(CATEGORY_COLORS);
export const PAYMENT_METHODS = ["Cash", "Card", "Mobile Pay", "Bank Transfer"] as const;
export const SUPPLIERS = [
  "Sfax Clay Works",
  "Djerba Pottery Co-op",
  "Nabeul Ceramics",
  "Independent Artisan",
] as const;

export async function loadKey(key: string, fallbackFn: () => any) {
  try {
    const res = await localStorage.get(key, false);
    if (res && res.value) return JSON.parse(res.value);
    throw new Error("empty");
  } catch {
    const fallback = fallbackFn();
    try {
      await localStorage.set(key, JSON.stringify(fallback), false);
    } catch (err) {
      console.error("Failed to initialize data:", err);
    }
    return fallback;
  }
}

export async function saveKey(key: string, value: any) {
  try {
    await localStorage.set(key, JSON.stringify(value), false);
  } catch (err) {
    console.error("Failed to save data:", err);
  }
}

export async function clearKey(key: string) {
  try {
    await localStorage.delete(key, false);
  } catch (err) {
    console.error("Failed to clear data:", err);
  }
}
