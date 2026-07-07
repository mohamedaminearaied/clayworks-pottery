export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function money(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Math.round(n || 0)
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
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS);
export const PAYMENT_METHODS = ["Cash", "Card", "Mobile Pay", "Bank Transfer"];
export const SUPPLIERS = [
  "Sfax Clay Works",
  "Djerba Pottery Co-op",
  "Nabeul Ceramics",
  "Independent Artisan",
];

export async function loadKey(key, fallbackFn) {
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

export async function saveKey(key, value) {
  try {
    await localStorage.set(key, JSON.stringify(value), false);
  } catch (err) {
    console.error("Failed to save data:", err);
  }
}

export async function clearKey(key) {
  try {
    await localStorage.delete(key, false);
  } catch (err) {
    console.error("Failed to clear data:", err);
  }
}
