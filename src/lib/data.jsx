import { CATEGORY_COLORS, PAYMENT_METHODS, SUPPLIERS } from "@/lib/utils";

export function seedProducts() {
  const base = [
    ["Terracotta Amphora Vase", "Vases", "VAS-101", "Tall hand-thrown amphora with a matte terracotta glaze.", 28, 74, 12, 4, "Sfax Clay Works"],
    ["Speckled Stoneware Bowl", "Bowls", "BWL-204", "Stoneware bowl with a speckled oatmeal glaze.", 9, 26, 30, 8, "Djerba Pottery Co-op"],
    ["Olive Branch Dinner Plate", "Plates", "PLT-312", "Wide dinner plate etched with an olive branch motif.", 11, 29, 22, 6, "Sfax Clay Works"],
    ["Rustic Espresso Cup", "Cups", "CUP-405", "Small espresso cup with an unglazed rim.", 5, 15, 40, 10, "Nabeul Ceramics"],
    ["Sand Dune Coffee Mug", "Mugs", "MUG-508", "Two-tone mug with a sand-dune glaze gradient.", 7, 21, 18, 8, "Nabeul Ceramics"],
    ["Hand-Carved Vase, Small", "Vases", "VAS-102", "Compact vase with hand-carved geometric lines.", 14, 38, 3, 5, "Djerba Pottery Co-op"],
    ["Glazed Serving Platter", "Plates", "PLT-313", "Large oval platter, reactive blue-green glaze.", 19, 52, 9, 4, "Sfax Clay Works"],
    ["Ceramic Wall Medallion", "Decorative Items", "DEC-601", "Sun-motif wall medallion, natural clay finish.", 12, 34, 15, 5, "Nabeul Ceramics"],
    ["Raku-Fired Tea Bowl", "Handmade Art", "ART-701", "One-of-a-kind raku tea bowl with crackle glaze.", 32, 96, 4, 3, "Independent Artisan"],
    ["Personalized Wedding Vase", "Custom Orders", "CUS-801", "Made-to-order vase engraved for weddings.", 22, 68, 6, 2, "Djerba Pottery Co-op"],
    ["Woven-Texture Fruit Bowl", "Bowls", "BWL-205", "Large bowl with a woven basket texture pressed in.", 13, 36, 0, 6, "Sfax Clay Works"],
    ["Minimalist Cereal Bowl Set", "Bowls", "BWL-206", "Set of two cream-glazed cereal bowls.", 10, 27, 25, 8, "Nabeul Ceramics"],
    ["Desert Rose Decorative Urn", "Decorative Items", "DEC-602", "Statement urn glazed in a desert-rose finish.", 26, 78, 2, 3, "Independent Artisan"],
    ["Everyday Latte Mug", "Mugs", "MUG-509", "Sturdy everyday mug, cream glaze, gold rim.", 6, 18, 34, 10, "Nabeul Ceramics"],
  ];
  return base.map(([name, category, sku, description, costPrice, sellingPrice, stock, minStock, supplier], i) => ({
    id: `p${i + 1}`,
    name,
    category,
    sku,
    description,
    costPrice,
    sellingPrice,
    stock,
    minStock,
    supplier,
    image: i % 2 === 0 ? "/unnamed.jpg" : "/unnamed1.jpg",
    dateAdded: new Date(2026, (i % 6) + 1, ((i * 3) % 27) + 1).toISOString().slice(0, 10),
    status: stock === 0 ? "Out of Stock" : "Available",
  }));
}

export function seedSales(products) {
  const sales = [];
  const customers = ["", "", "Amina B.", "", "Karim T.", "Salma R.", "", "Youssef M.", "", "Nour H."];
  let invoiceCounter = 1001;
  const now = new Date(2026, 6, 6);

  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const salesThisMonth = 5 + Math.floor(Math.random() * 5);
    for (let s = 0; s < salesThisMonth; s++) {
      const day = 1 + Math.floor(Math.random() * 27);
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const itemCount = 1 + Math.floor(Math.random() * 3);
      const items = [];
      const usedIds = new Set();
      for (let it = 0; it < itemCount; it++) {
        const product = products[Math.floor(Math.random() * products.length)];
        if (usedIds.has(product.id)) continue;
        usedIds.add(product.id);
        const qty = 1 + Math.floor(Math.random() * 3);
        items.push({
          productId: product.id,
          name: product.name,
          qty,
          unitPrice: product.sellingPrice,
          costPrice: product.costPrice,
          total: qty * product.sellingPrice,
        });
      }
      if (items.length === 0) continue;
      const totalAmount = items.reduce((a, it) => a + it.total, 0);
      sales.push({
        id: `s${invoiceCounter}`,
        invoiceNumber: `INV-${invoiceCounter}`,
        date: date.toISOString().slice(0, 10),
        items,
        totalAmount,
        paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
        customerName: customers[Math.floor(Math.random() * customers.length)],
      });
      invoiceCounter++;
    }
  }

  return sales.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function seedPurchases(products) {
  const notesPool = ["Routine restock", "Bulk order discount", "New glaze batch", "Pre-season restock", "Supplier ran a promotion", ""];
  const purchases = [];
  let counter = 1;
  const now = new Date(2026, 6, 6);

  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const day = 1 + Math.floor(Math.random() * 26);
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const quantity = 5 + Math.floor(Math.random() * 20);
      const purchasePrice = Math.max(1, Math.round(product.costPrice * (0.9 + Math.random() * 0.2)));
      purchases.push({
        id: `pu${counter}`,
        supplier: product.supplier,
        productId: product.id,
        productName: product.name,
        quantity,
        purchasePrice,
        totalCost: quantity * purchasePrice,
        date: date.toISOString().slice(0, 10),
        notes: notesPool[Math.floor(Math.random() * notesPool.length)],
      });
      counter++;
    }
  }

  return purchases.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function seedUsers() {
  return [
    { id: "u1", username: "owner", password: "owner123", name: "Amira Ben Salah", role: "Owner" },
    { id: "u2", username: "manager", password: "manager123", name: "Karim Feki", role: "Manager" },
    { id: "u3", username: "employee", password: "employee123", name: "Sara Trabelsi", role: "Employee" },
  ];
}

export const ROLE_INFO = {
  Owner: { color: "#93481D", bg: "#F0DCC9" },
  Manager: { color: "#465634", bg: "#E4EAD9" },
  Employee: { color: "#B8863A", bg: "#F3E5CB" },
};

export function permissionsFor(role) {
  return {
    viewCost: role === "Owner" || role === "Manager",
    viewProfit: role === "Owner",
    editInventory: role === "Owner" || role === "Manager",
    deleteRecords: role === "Owner",
    managePurchases: role === "Owner" || role === "Manager",
  };
}
