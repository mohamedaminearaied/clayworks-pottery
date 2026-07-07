import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  LayoutGrid, Package, Receipt, Search, Plus, Pencil, Trash2, X,
  AlertTriangle, TrendingUp, DollarSign, Boxes, ShoppingBag, Flame,
  Check, Truck, LogOut, Lock, User, Download, FileSpreadsheet, Printer,
  ChevronDown, ShieldCheck,
} from "lucide-react";

/* ---------------------------------------------------------------
   THEME — Ember & Clay
--------------------------------------------------------------- */
const T = {
  cream: "#F6EFE3",
  creamDeep: "#EEE2CC",
  paper: "#FFFCF6",
  clay: "#C1622B",
  clayDeep: "#93481D",
  clayFaint: "#F0DCC9",
  brown: "#3C2A1E",
  brownSoft: "#6B5544",
  brownFaint: "#BBA98F",
  beige: "#E4D6BE",
  sage: "#6E8354",
  sageDeep: "#465634",
  sageFaint: "#E4EAD9",
  rust: "#9C3B2A",
  rustFaint: "#F4DCD5",
  gold: "#B8863A",
  goldFaint: "#F3E5CB",
  line: "#E2D4BC",
};

const CATEGORY_COLORS = {
  Vases: T.clay,
  Bowls: T.sage,
  Plates: T.gold,
  Cups: T.brownSoft,
  Mugs: T.clayDeep,
  "Decorative Items": T.sageDeep,
  "Handmade Art": T.rust,
  "Custom Orders": "#7A5C3E",
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);
const PAYMENT_METHODS = ["Cash", "Card", "Mobile Pay", "Bank Transfer"];
const SUPPLIERS = ["Sfax Clay Works", "Djerba Pottery Co-op", "Nabeul Ceramics", "Independent Artisan"];

/* ---------------------------------------------------------------
   SEED DATA
--------------------------------------------------------------- */
function seedProducts() {
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
    name, category, sku, description, costPrice, sellingPrice, stock, minStock, supplier,
    dateAdded: new Date(2026, (i % 6) + 1, ((i * 3) % 27) + 1).toISOString().slice(0, 10),
    status: stock === 0 ? "Out of Stock" : "Available",
  }));
}

function seedSales(products) {
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

function seedPurchases(products) {
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

function seedUsers() {
  return [
    { id: "u1", username: "owner", password: "owner123", name: "Amira Ben Salah", role: "Owner" },
    { id: "u2", username: "manager", password: "manager123", name: "Karim Feki", role: "Manager" },
    { id: "u3", username: "employee", password: "employee123", name: "Sara Trabelsi", role: "Employee" },
  ];
}

/* ---------------------------------------------------------------
   STORAGE HELPERS
--------------------------------------------------------------- */
async function loadKey(key, fallbackFn) {
  try {
    const res = await localStorage.get(key, false);
    if (res && res.value) return JSON.parse(res.value);
    throw new Error("empty");
  } catch {
    const fallback = fallbackFn();
    try {
      await localStorage.set(key, JSON.stringify(fallback), false);
    }  catch (err) {
    console.error("Failed to load data:", err);
    return fallback;
  }
}
}

async function saveKey(key, value) {
  try {
    await localStorage.set(key, JSON.stringify(value), false);
  } catch (err) {
    console.error("Failed to save data:", err);}

}

async function clearKey(key) {
  try {
    await localStorage.delete(key, false);
  } catch (err) {
    console.error("Failed to clear data:", err);}
}

/* ---------------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------------- */
function money(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Math.round(n || 0)
  );
}

function ClayBar({ value, max, tone }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color = tone === "danger" ? T.rust : tone === "warn" ? T.gold : T.sage;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 110 }}>
      <div style={{ flex: 1, height: 8, borderRadius: 999, background: T.creamDeep, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: color }} />
      </div>
      <span style={{ fontSize: 12, color: T.brownSoft, minWidth: 22, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function Badge({ children, color, bg }) {
  return (
    <span
      style={{
        display: "inline-block", fontSize: 12, fontWeight: 600, padding: "3px 10px",
        borderRadius: 999, color, background: bg, whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: T.brownSoft, fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: accent + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={17} color={accent} />
        </div>
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: T.brown, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: T.brownSoft }}>{sub}</div>}
    </div>
  );
}

function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(60,42,30,0.35)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", zIndex: 50, overflowY: "auto" }}
      onClick={onClose}
    >
      <div style={{ background: T.paper, borderRadius: 16, width: "100%", maxWidth: width, border: `1px solid ${T.line}`, boxShadow: "0 12px 32px rgba(60,42,30,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${T.line}` }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, color: T.brown, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.brownSoft, padding: 4, borderRadius: 8, display: "flex" }}>
            <X size={19} />
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 11px", borderRadius: 9, border: `1px solid ${T.line}`,
  background: T.cream, color: T.brown, fontSize: 14, outline: "none", boxSizing: "border-box",
};
const labelStyle = { fontSize: 12.5, fontWeight: 600, color: T.brownSoft, marginBottom: 5, display: "block" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, type = "button", style }) {
  return (
    <button type={type} onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, background: T.clay, color: T.paper, border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", ...style }}>
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", color: T.brown, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", ...style }}>
      {children}
    </button>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, margin: 0, color: T.brown }}>{title}</h2>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: T.brownSoft }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------------------------------------
   EXPORT BAR — CSV, Excel, and print-to-PDF for any table
--------------------------------------------------------------- */
function toCSV(columns, rows) {
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => esc(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => esc(row[c.key])).join(",")).join("\n");
  return `${header}\n${body}`;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ExportBar({ title, columns, rows, filename, onPrint }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function exportExcel() {
    const plain = rows.map((row) => {
      const o = {};
      columns.forEach((c) => (o[c.label] = row[c.key]));
      return o;
    });
    const ws = XLSX.utils.json_to_sheet(plain);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 30));
    XLSX.writeFile(wb, `${filename}.xlsx`);
    setOpen(false);
  }

  function exportCSV() {
    downloadBlob(toCSV(columns, rows), `${filename}.csv`, "text/csv;charset=utf-8;");
    setOpen(false);
  }

  function printPDF() {
    onPrint({ title, columns, rows });
    setOpen(false);
  }

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <GhostButton onClick={() => setOpen((o) => !o)}>
        <Download size={14} /> Export <ChevronDown size={13} />
      </GhostButton>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: T.paper, border: `1px solid ${T.line}`, borderRadius: 10, boxShadow: "0 8px 20px rgba(60,42,30,0.14)", zIndex: 20, width: 190, overflow: "hidden" }}>
          {[
            { label: "Export as CSV", icon: FileSpreadsheet, fn: exportCSV },
            { label: "Export as Excel", icon: FileSpreadsheet, fn: exportExcel },
            { label: "Print / Save as PDF", icon: Printer, fn: printPDF },
          ].map(({ label, icon: Icon, fn }) => (
            <button
              key={label}
              onClick={fn}
              style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.brown, textAlign: "left" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = T.cream)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <Icon size={14} color={T.brownSoft} /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PrintArea({ data }) {
  if (!data) return null;
  const { title, columns, rows } = data;
  return (
    <div id="print-root" style={{ padding: 24, fontFamily: "Inter, sans-serif", color: "#1a1a1a" }}>
      <h2 style={{ fontFamily: "'Fraunces', serif", marginBottom: 4 }}>Ember & Clay</h2>
      <p style={{ marginTop: 0, marginBottom: 18, color: "#555" }}>{title} — generated {new Date().toLocaleDateString()}</p>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: "left", borderBottom: "1.5px solid #999", padding: "6px 8px", fontSize: 12 }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} style={{ borderBottom: "0.5px solid #ccc", padding: "6px 8px", fontSize: 12 }}>{String(row[c.key] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------------
   AUTH — mock login gate (frontend-only, no real backend)
--------------------------------------------------------------- */
const ROLE_INFO = {
  Owner: { color: T.clayDeep, bg: T.clayFaint },
  Manager: { color: T.sageDeep, bg: T.sageFaint },
  Employee: { color: T.gold, bg: T.goldFaint },
};

function permissionsFor(role) {
  return {
    viewCost: role === "Owner" || role === "Manager",
    viewProfit: role === "Owner",
    editInventory: role === "Owner" || role === "Manager",
    deleteRecords: role === "Owner",
    managePurchases: role === "Owner" || role === "Manager",
  };
}

function Login({ users, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const match = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    if (!match) {
      setError("That username or password isn't right. Try again.");
      return;
    }
    setError("");
    onLogin(match);
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: T.cream, minHeight: 600, borderRadius: 18, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <form onSubmit={submit} style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 16, padding: 32, width: "100%", maxWidth: 360, boxShadow: "0 12px 32px rgba(60,42,30,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.clay, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={20} color={T.paper} />
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: T.brown }}>Ember & Clay</div>
            <div style={{ fontSize: 11.5, color: T.brownSoft }}>Studio console sign-in</div>
          </div>
        </div>

        <Field label="Username">
          <div style={{ position: "relative" }}>
            <User size={15} color={T.brownSoft} style={{ position: "absolute", left: 11, top: 10 }} />
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="owner" autoFocus />
          </div>
        </Field>
        <Field label="Password">
          <div style={{ position: "relative" }}>
            <Lock size={15} color={T.brownSoft} style={{ position: "absolute", left: 11, top: 10 }} />
            <input style={{ ...inputStyle, paddingLeft: 34 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </Field>

        {error && (
          <div style={{ background: T.rustFaint, color: T.rust, fontSize: 12.5, padding: "8px 10px", borderRadius: 8, marginBottom: 14 }}>{error}</div>
        )}

        <PrimaryButton type="submit" style={{ width: "100%", justifyContent: "center" }}>
          <ShieldCheck size={15} /> Sign in
        </PrimaryButton>

        <div style={{ marginTop: 18, padding: "10px 12px", background: T.cream, borderRadius: 10, fontSize: 11.5, color: T.brownSoft, lineHeight: 1.6 }}>
          Demo accounts — owner / owner123, manager / manager123, employee / employee123. Roles change what each sign-in can see and edit.
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------
   MAIN APP
--------------------------------------------------------------- */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [users, setUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [view, setView] = useState("dashboard");
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    (async () => {
      const p = await loadKey("clay_products", seedProducts);
      const s = await loadKey("clay_sales", () => seedSales(p));
      const pu = await loadKey("clay_purchases", () => seedPurchases(p));
      const u = await loadKey("clay_users", seedUsers);
      const sess = await loadKey("clay_session", () => null);
      setProducts(p);
      setSales(s);
      setPurchases(pu);
      setUsers(u);
      setSession(sess);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!printData) return;
    const t = setTimeout(() => {
      window.print();
      setPrintData(null);
    }, 60);
    return () => clearTimeout(t);
  }, [printData]);

  const updateProducts = useCallback((next) => {
    setProducts(next);
    saveKey("clay_products", next);
  }, []);
  const updateSales = useCallback((next) => {
    setSales(next);
    saveKey("clay_sales", next);
  }, []);
  const updatePurchases = useCallback((next) => {
    setPurchases(next);
    saveKey("clay_purchases", next);
  }, []);

  function handleLogin(user) {
    const sess = { username: user.username, name: user.name, role: user.role };
    setSession(sess);
    saveKey("clay_session", sess);
  }

  function handleLogout() {
    setSession(null);
    clearKey("clay_session");
    setView("dashboard");
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, color: T.brownSoft, fontFamily: "Inter, sans-serif" }}>
        Loading the studio ledger…
      </div>
    );
  }

  if (!session) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  const perms = permissionsFor(session.role);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: T.cream, color: T.brown, minHeight: 600, borderRadius: 18, overflow: "hidden", display: "flex", border: `1px solid ${T.line}` }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${T.brownFaint}; border-radius: 999px; }
        table { border-collapse: collapse; width: 100%; }
        th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; color: ${T.brownSoft}; padding: 10px 12px; border-bottom: 1px solid ${T.line}; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid ${T.line}; font-size: 13.5px; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        #print-root { display: none; }
        @media print {
          body * { visibility: hidden; }
          #print-root, #print-root * { visibility: visible; }
          #print-root { display: block; position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
      <PrintArea data={printData} />
      <Sidebar
        view={view}
        setView={setView}
        lowStockCount={products.filter((p) => p.stock <= p.minStock).length}
        session={session}
        onLogout={handleLogout}
      />
      <div style={{ flex: 1, minWidth: 0, padding: 28, overflowY: "auto", maxHeight: 860 }}>
        {view === "dashboard" && <Dashboard products={products} sales={sales} purchases={purchases} setView={setView} perms={perms} />}
        {view === "inventory" && <Inventory products={products} setProducts={updateProducts} perms={perms} setPrintData={setPrintData} />}
        {view === "sales" && <Sales sales={sales} setSales={updateSales} products={products} setProducts={updateProducts} perms={perms} setPrintData={setPrintData} />}
        {view === "purchases" && <Purchases purchases={purchases} setPurchases={updatePurchases} products={products} setProducts={updateProducts} perms={perms} setPrintData={setPrintData} />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SIDEBAR
--------------------------------------------------------------- */
function Sidebar({ view, setView, lowStockCount, session, onLogout }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { key: "inventory", label: "Inventory", icon: Package },
    { key: "purchases", label: "Purchases", icon: Truck },
    { key: "sales", label: "Sales", icon: Receipt },
  ];
  const roleInfo = ROLE_INFO[session.role] || ROLE_INFO.Employee;
  return (
    <div style={{ width: 216, background: T.brown, color: T.cream, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 22, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: T.clay, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Flame size={18} color={T.paper} />
        </div>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, lineHeight: 1.1 }}>Ember & Clay</div>
          <div style={{ fontSize: 11, color: T.brownFaint }}>Studio console</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                background: active ? T.clay : "transparent", color: active ? T.paper : T.beige,
                fontSize: 14, fontWeight: 600, textAlign: "left",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={16} />
                {label}
              </span>
              {key === "inventory" && lowStockCount > 0 && (
                <span style={{ background: active ? T.paper : T.rust, color: active ? T.clayDeep : T.paper, fontSize: 10.5, fontWeight: 700, padding: "1px 6px", borderRadius: 999 }}>
                  {lowStockCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.beige, color: T.brown, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {session.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.name}</div>
              <Badge color={roleInfo.color} bg={roleInfo.bg}>{session.role}</Badge>
            </div>
          </div>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", background: "none", border: "none", color: T.brownFaint, fontSize: 12, cursor: "pointer", padding: "4px 0" }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   DASHBOARD
--------------------------------------------------------------- */
function Dashboard({ products, sales, purchases, setView, perms }) {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((a, s) => a + s.totalAmount, 0);
    const totalProfit = sales.reduce((a, s) => a + s.items.reduce((b, it) => b + (it.unitPrice - it.costPrice) * it.qty, 0), 0);
    const totalSalesCount = sales.length;
    const productsSold = sales.reduce((a, s) => a + s.items.reduce((b, it) => b + it.qty, 0), 0);
    const inventoryValue = products.reduce((a, p) => a + p.stock * p.costPrice, 0);
    const productsInStock = products.reduce((a, p) => a + p.stock, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
    const outOfStock = products.filter((p) => p.stock === 0);
    const totalPurchaseCost = purchases.reduce((a, pu) => a + pu.totalCost, 0);
    return { totalRevenue, totalProfit, totalSalesCount, productsSold, inventoryValue, productsInStock, lowStock, outOfStock, totalPurchaseCost };
  }, [products, sales, purchases]);

  const monthly = useMemo(() => {
    const map = {};
    sales.forEach((s) => {
      const d = new Date(s.date);
      const key = d.toLocaleString("en-US", { month: "short" });
      if (!map[key]) map[key] = { month: key, revenue: 0, profit: 0, order: d.getMonth() };
      map[key].revenue += s.totalAmount;
      map[key].profit += s.items.reduce((b, it) => b + (it.unitPrice - it.costPrice) * it.qty, 0);
    });
    return Object.values(map).sort((a, b) => a.order - b.order);
  }, [sales]);

  const bestSellers = useMemo(() => {
    const map = {};
    sales.forEach((s) => s.items.forEach((it) => {
      map[it.productId] = map[it.productId] || { name: it.name, qty: 0, revenue: 0 };
      map[it.productId].qty += it.qty;
      map[it.productId].revenue += it.total;
    }));
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [sales]);

  const recentSales = useMemo(() => [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [sales]);

  const categoryDist = useMemo(() => {
    const map = {};
    products.forEach((p) => { map[p.category] = (map[p.category] || 0) + p.stock; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [products]);

  return (
    <div>
      <SectionHeader title="Dashboard" subtitle="Today's snapshot of the storefront's health." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 22 }}>
        <StatCard icon={DollarSign} label="Total revenue" value={money(stats.totalRevenue)} sub={`${stats.totalSalesCount} sales recorded`} accent={T.clay} />
        {perms.viewProfit && (
          <StatCard icon={TrendingUp} label="Total profit" value={money(stats.totalProfit)} sub={stats.totalRevenue ? `${Math.round((stats.totalProfit / stats.totalRevenue) * 100)}% margin` : "—"} accent={T.sage} />
        )}
        <StatCard icon={ShoppingBag} label="Products sold" value={stats.productsSold} sub="Units across all sales" accent={T.gold} />
        <StatCard icon={Boxes} label="Inventory value" value={money(stats.inventoryValue)} sub={`${stats.productsInStock} units on shelf`} accent={T.brownSoft} />
        {perms.viewCost && (
          <StatCard icon={Truck} label="Purchase spend" value={money(stats.totalPurchaseCost)} sub={`${purchases.length} purchase orders`} accent={T.clayDeep} />
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, padding: "18px 20px" }}>
          <h4 style={{ margin: "0 0 10px", fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600 }}>Monthly revenue</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: T.brownSoft }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: T.brownSoft }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 10, fontSize: 13 }} formatter={(v) => money(v)} />
              <Bar dataKey="revenue" fill={T.clay} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, padding: "18px 20px" }}>
          <h4 style={{ margin: "0 0 10px", fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600 }}>Stock by category</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryDist} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                {categoryDist.map((c, i) => (<Cell key={i} fill={CATEGORY_COLORS[c.name] || T.brownSoft} />))}
              </Pie>
              <Tooltip contentStyle={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {perms.viewProfit && (
        <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 10px", fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600 }}>Revenue vs profit trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: T.brownSoft }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: T.brownSoft }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 10, fontSize: 13 }} formatter={(v) => money(v)} />
              <Line type="monotone" dataKey="revenue" stroke={T.clay} strokeWidth={2.5} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="profit" stroke={T.sage} strokeWidth={2.5} dot={false} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: T.brownSoft, marginTop: 4 }}>
            <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 999, background: T.clay, marginRight: 5 }} />Revenue</span>
            <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 999, background: T.sage, marginRight: 5 }} />Profit</span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, padding: "18px 20px" }}>
          <h4 style={{ margin: "0 0 10px", fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600 }}>Best sellers</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bestSellers.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: T.clayFaint, color: T.clayDeep, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: T.brown, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</span>
                </div>
                <span style={{ fontSize: 12.5, color: T.brownSoft, flexShrink: 0 }}>{b.qty} sold</span>
              </div>
            ))}
            {bestSellers.length === 0 && <div style={{ fontSize: 13, color: T.brownSoft }}>No sales recorded yet.</div>}
          </div>
        </div>

        <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, padding: "18px 20px" }}>
          <h4 style={{ margin: "0 0 10px", fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600 }}>Recent sales</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentSales.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.invoiceNumber}</div>
                  <div style={{ fontSize: 11.5, color: T.brownSoft }}>{s.date} {s.customerName ? `· ${s.customerName}` : ""}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.clayDeep, flexShrink: 0 }}>{money(s.totalAmount)}</span>
              </div>
            ))}
            {recentSales.length === 0 && <div style={{ fontSize: 13, color: T.brownSoft }}>No sales yet.</div>}
          </div>
          <button onClick={() => setView("sales")} style={{ marginTop: 12, background: "none", border: "none", color: T.clayDeep, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}>Go to sales →</button>
        </div>
      </div>

      <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h4 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600 }}>Low stock alerts</h4>
          {stats.lowStock.length + stats.outOfStock.length > 0 && (
            <Badge color={T.rust} bg={T.rustFaint}>{stats.lowStock.length + stats.outOfStock.length} items</Badge>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...stats.outOfStock, ...stats.lowStock].slice(0, 6).map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <AlertTriangle size={14} color={p.stock === 0 ? T.rust : T.gold} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              </div>
              <Badge color={p.stock === 0 ? T.rust : T.clayDeep} bg={p.stock === 0 ? T.rustFaint : T.goldFaint}>
                {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
              </Badge>
            </div>
          ))}
          {stats.lowStock.length + stats.outOfStock.length === 0 && <div style={{ fontSize: 13, color: T.brownSoft }}>Every product is comfortably stocked.</div>}
        </div>
        <button onClick={() => setView("inventory")} style={{ marginTop: 12, background: "none", border: "none", color: T.clayDeep, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}>Go to inventory →</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   INVENTORY
--------------------------------------------------------------- */
const emptyProduct = {
  name: "", category: CATEGORIES[0], sku: "", description: "", costPrice: "", sellingPrice: "",
  stock: "", minStock: "", supplier: "", dateAdded: new Date().toISOString().slice(0, 10),
};

function Inventory({ products, setProducts, perms, setPrintData }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()) || p.supplier.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      const matchesStock = stockFilter === "All" || (stockFilter === "Low" && p.stock > 0 && p.stock <= p.minStock) || (stockFilter === "Out" && p.stock === 0) || (stockFilter === "In stock" && p.stock > p.minStock);
      return matchesQuery && matchesCategory && matchesStock;
    });
  }, [products, query, categoryFilter, stockFilter]);

  const exportColumns = [
    { key: "name", label: "Product" }, { key: "category", label: "Category" }, { key: "sku", label: "SKU" },
    ...(perms.viewCost ? [{ key: "costPrice", label: "Cost price" }] : []),
    { key: "sellingPrice", label: "Selling price" }, { key: "stock", label: "Stock" }, { key: "minStock", label: "Min stock" },
    { key: "supplier", label: "Supplier" }, { key: "status", label: "Status" },
  ];

  function openAdd() { setEditing(null); setForm(emptyProduct); setModalOpen(true); }
  function openEdit(p) {
    setEditing(p.id);
    setForm({ ...p, costPrice: String(p.costPrice), sellingPrice: String(p.sellingPrice), stock: String(p.stock), minStock: String(p.minStock) });
    setModalOpen(true);
  }

  function saveForm() {
    if (!form.name.trim() || !form.sku.trim()) return;
    const stock = Number(form.stock) || 0;
    const record = {
      ...form, costPrice: Number(form.costPrice) || 0, sellingPrice: Number(form.sellingPrice) || 0,
      stock, minStock: Number(form.minStock) || 0, status: stock === 0 ? "Out of Stock" : "Available",
    };
    if (editing) setProducts(products.map((p) => (p.id === editing ? { ...p, ...record, id: editing } : p)));
    else setProducts([{ ...record, id: `p${Date.now()}` }, ...products]);
    setModalOpen(false);
  }

  function confirmDelete() {
    setProducts(products.filter((p) => p.id !== deleteTarget));
    setDeleteTarget(null);
  }

  return (
    <div>
      <SectionHeader
        title="Inventory"
        subtitle={`${products.length} products across ${CATEGORIES.length} categories`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <ExportBar title="Inventory" columns={exportColumns} rows={filtered} filename="inventory" onPrint={setPrintData} />
            {perms.editInventory && (
              <PrimaryButton onClick={openAdd}><Plus size={15} /> Add product</PrimaryButton>
            )}
          </div>
        }
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} color={T.brownSoft} style={{ position: "absolute", left: 11, top: 10 }} />
          <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder="Search name, SKU, or supplier" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select style={{ ...inputStyle, width: 170 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
        </select>
        <select style={{ ...inputStyle, width: 150 }} value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option>All</option><option>In stock</option><option>Low</option><option>Out</option>
        </select>
      </div>

      <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>SKU</th>
                {perms.viewCost && <th>Cost</th>}
                <th>Price</th><th>Stock</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: (CATEGORY_COLORS[p.category] || T.brownSoft) + "22", color: CATEGORY_COLORS[p.category] || T.brownSoft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                        {p.name.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: T.brownSoft }}>{p.supplier}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge color={CATEGORY_COLORS[p.category] || T.brownSoft} bg={(CATEGORY_COLORS[p.category] || T.brownSoft) + "1c"}>{p.category}</Badge></td>
                  <td style={{ color: T.brownSoft }}>{p.sku}</td>
                  {perms.viewCost && <td>{money(p.costPrice)}</td>}
                  <td style={{ fontWeight: 600 }}>{money(p.sellingPrice)}</td>
                  <td><ClayBar value={p.stock} max={Math.max(p.minStock * 3, p.stock, 10)} tone={p.stock === 0 ? "danger" : p.stock <= p.minStock ? "warn" : "ok"} /></td>
                  <td>
                    {p.stock === 0 ? <Badge color={T.rust} bg={T.rustFaint}>Out of stock</Badge> : p.stock <= p.minStock ? <Badge color={T.clayDeep} bg={T.goldFaint}>Low stock</Badge> : <Badge color={T.sageDeep} bg={T.sageFaint}>Available</Badge>}
                  </td>
                  <td>
                    {perms.editInventory && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(p)} style={{ background: "none", border: "none", cursor: "pointer", color: T.brownSoft, padding: 5 }}><Pencil size={15} /></button>
                        {perms.deleteRecords && (
                          <button onClick={() => setDeleteTarget(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.rust, padding: 5 }}><Trash2 size={15} /></button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", color: T.brownSoft, padding: 28 }}>No products match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title={editing ? "Edit product" : "Add product"} onClose={() => setModalOpen(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Product name"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Terracotta amphora vase" /></Field>
            <Field label="SKU / code"><input style={inputStyle} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="VAS-101" /></Field>
            <Field label="Category">
              <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
              </select>
            </Field>
            <Field label="Supplier"><input style={inputStyle} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Sfax Clay Works" /></Field>
            <Field label="Cost price"><input style={inputStyle} type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="0" /></Field>
            <Field label="Selling price"><input style={inputStyle} type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="0" /></Field>
            <Field label="Stock quantity"><input style={inputStyle} type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" /></Field>
            <Field label="Minimum stock level"><input style={inputStyle} type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="0" /></Field>
          </div>
          <Field label="Description"><textarea style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description of the piece" /></Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <GhostButton onClick={() => setModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={saveForm}><Check size={15} /> {editing ? "Save changes" : "Add product"}</PrimaryButton>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Remove product" onClose={() => setDeleteTarget(null)} width={420}>
          <p style={{ fontSize: 14, color: T.brownSoft, marginTop: 0 }}>This removes the product from inventory permanently. Past sales and purchase records are unaffected.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <GhostButton onClick={() => setDeleteTarget(null)}>Cancel</GhostButton>
            <PrimaryButton onClick={confirmDelete} style={{ background: T.rust }}><Trash2 size={15} /> Remove</PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   PURCHASES
--------------------------------------------------------------- */
function Purchases({ purchases, setPurchases, products, setProducts, perms, setPrintData }) {
  const [query, setQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewingPurchase, setViewingPurchase] = useState(null);

  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(10);
  const [purchasePrice, setPurchasePrice] = useState(products[0]?.costPrice || 0);
  const [supplier, setSupplier] = useState(products[0]?.supplier || SUPPLIERS[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [updateCost, setUpdateCost] = useState(true);

  const filtered = useMemo(() => {
    return purchases.filter((pu) => {
      const matchesQuery = !query || pu.productName.toLowerCase().includes(query.toLowerCase()) || pu.supplier.toLowerCase().includes(query.toLowerCase());
      const matchesSupplier = supplierFilter === "All" || pu.supplier === supplierFilter;
      return matchesQuery && matchesSupplier;
    });
  }, [purchases, query, supplierFilter]);

  const exportColumns = [
    { key: "supplier", label: "Supplier" }, { key: "productName", label: "Product" }, { key: "quantity", label: "Quantity" },
    { key: "purchasePrice", label: "Unit cost" }, { key: "totalCost", label: "Total cost" }, { key: "date", label: "Date" }, { key: "notes", label: "Notes" },
  ];

  function onProductChange(id) {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (p) { setPurchasePrice(p.costPrice); setSupplier(p.supplier); }
  }

  function resetForm() {
    setProductId(products[0]?.id || "");
    setQuantity(10);
    setPurchasePrice(products[0]?.costPrice || 0);
    setSupplier(products[0]?.supplier || SUPPLIERS[0]);
    setDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setUpdateCost(true);
  }

  function submitPurchase() {
    const product = products.find((p) => p.id === productId);
    if (!product || Number(quantity) <= 0) return;
    const qty = Number(quantity);
    const price = Number(purchasePrice) || 0;
    const record = {
      id: `pu${Date.now()}`, supplier, productId, productName: product.name, quantity: qty,
      purchasePrice: price, totalCost: qty * price, date, notes,
    };
    setPurchases([record, ...purchases]);
    setProducts(products.map((p) => {
      if (p.id !== productId) return p;
      const stock = p.stock + qty;
      return { ...p, stock, status: "Available", costPrice: updateCost ? price : p.costPrice };
    }));
    resetForm();
    setModalOpen(false);
  }

  function confirmDelete() {
    setPurchases(purchases.filter((pu) => pu.id !== deleteTarget));
    setDeleteTarget(null);
  }

  return (
    <div>
      <SectionHeader
        title="Purchase history"
        subtitle={`${purchases.length} purchase orders from ${new Set(purchases.map((p) => p.supplier)).size} suppliers`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <ExportBar title="Purchase history" columns={exportColumns} rows={filtered} filename="purchases" onPrint={setPrintData} />
            {perms.managePurchases && (
              <PrimaryButton onClick={() => setModalOpen(true)}><Plus size={15} /> Record purchase</PrimaryButton>
            )}
          </div>
        }
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} color={T.brownSoft} style={{ position: "absolute", left: 11, top: 10 }} />
          <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder="Search product or supplier" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select style={{ ...inputStyle, width: 200 }} value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
          <option>All</option>
          {SUPPLIERS.map((s) => (<option key={s}>{s}</option>))}
        </select>
      </div>

      <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Supplier</th><th>Product</th><th>Quantity</th><th>Unit cost</th><th>Total cost</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((pu) => (
                <tr key={pu.id}>
                  <td>{pu.supplier}</td>
                  <td style={{ fontWeight: 600 }}>{pu.productName}</td>
                  <td>{pu.quantity}</td>
                  <td>{money(pu.purchasePrice)}</td>
                  <td style={{ fontWeight: 600, color: T.clayDeep }}>{money(pu.totalCost)}</td>
                  <td style={{ color: T.brownSoft }}>{pu.date}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setViewingPurchase(pu)} style={{ background: "none", border: "none", cursor: "pointer", color: T.brownSoft, padding: 5, fontSize: 12.5, fontWeight: 600 }}>View</button>
                      {perms.deleteRecords && (
                        <button onClick={() => setDeleteTarget(pu.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.rust, padding: 5 }}><Trash2 size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: T.brownSoft, padding: 28 }}>No purchases match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title="Record a purchase" onClose={() => { setModalOpen(false); resetForm(); }} width={560}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Product">
              <select style={inputStyle} value={productId} onChange={(e) => onProductChange(e.target.value)}>
                {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </Field>
            <Field label="Supplier">
              <input style={inputStyle} value={supplier} onChange={(e) => setSupplier(e.target.value)} list="supplier-list" />
              <datalist id="supplier-list">{SUPPLIERS.map((s) => (<option key={s} value={s} />))}</datalist>
            </Field>
            <Field label="Quantity purchased"><input style={inputStyle} type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} /></Field>
            <Field label="Purchase price (per unit)"><input style={inputStyle} type="number" min={0} value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} /></Field>
            <Field label="Purchase date"><input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Total cost">
              <div style={{ ...inputStyle, background: T.creamDeep, fontWeight: 600 }}>{money((Number(quantity) || 0) * (Number(purchasePrice) || 0))}</div>
            </Field>
          </div>
          <Field label="Notes (optional)"><textarea style={{ ...inputStyle, minHeight: 56, resize: "vertical" }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Bulk order, restock, new glaze batch…" /></Field>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.brownSoft, marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" checked={updateCost} onChange={(e) => setUpdateCost(e.target.checked)} />
            Update this product's cost price to match this purchase
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <GhostButton onClick={() => { setModalOpen(false); resetForm(); }}>Cancel</GhostButton>
            <PrimaryButton onClick={submitPurchase}><Check size={15} /> Record purchase</PrimaryButton>
          </div>
        </Modal>
      )}

      {viewingPurchase && (
        <Modal title="Purchase details" onClose={() => setViewingPurchase(null)} width={420}>
          <div style={{ fontSize: 13.5, lineHeight: 2 }}>
            <div><strong>Supplier:</strong> {viewingPurchase.supplier}</div>
            <div><strong>Product:</strong> {viewingPurchase.productName}</div>
            <div><strong>Quantity:</strong> {viewingPurchase.quantity}</div>
            <div><strong>Unit cost:</strong> {money(viewingPurchase.purchasePrice)}</div>
            <div><strong>Total cost:</strong> {money(viewingPurchase.totalCost)}</div>
            <div><strong>Date:</strong> {viewingPurchase.date}</div>
            {viewingPurchase.notes && <div><strong>Notes:</strong> {viewingPurchase.notes}</div>}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete purchase record" onClose={() => setDeleteTarget(null)} width={420}>
          <p style={{ fontSize: 14, color: T.brownSoft, marginTop: 0 }}>This deletes the purchase order permanently. Stock already added will not be reversed automatically.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <GhostButton onClick={() => setDeleteTarget(null)}>Cancel</GhostButton>
            <PrimaryButton onClick={confirmDelete} style={{ background: T.rust }}><Trash2 size={15} /> Delete</PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   SALES
--------------------------------------------------------------- */
function Sales({ sales, setSales, products, setProducts, perms, setPrintData }) {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [lineItems, setLineItems] = useState([]);
  const [pickedProduct, setPickedProduct] = useState(products[0]?.id || "");
  const [pickedQty, setPickedQty] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));

  const filtered = useMemo(() => {
    const now = new Date(2026, 6, 6);
    return sales.filter((s) => {
      const matchesQuery = !query || s.invoiceNumber.toLowerCase().includes(query.toLowerCase()) || (s.customerName || "").toLowerCase().includes(query.toLowerCase());
      let matchesDate = true;
      const d = new Date(s.date);
      if (dateFilter === "Today") matchesDate = s.date === now.toISOString().slice(0, 10);
      if (dateFilter === "This week") matchesDate = now - d <= 7 * 86400000 && d <= now;
      if (dateFilter === "This month") matchesDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (dateFilter === "This year") matchesDate = d.getFullYear() === now.getFullYear();
      return matchesQuery && matchesDate;
    });
  }, [sales, query, dateFilter]);

  const exportColumns = [
    { key: "invoiceNumber", label: "Invoice" }, { key: "date", label: "Date" }, { key: "customerName", label: "Customer" },
    { key: "itemsSummary", label: "Items" }, { key: "paymentMethod", label: "Payment" }, { key: "totalAmount", label: "Total" },
  ];
  const exportRows = filtered.map((s) => ({ ...s, itemsSummary: s.items.map((it) => `${it.name} x${it.qty}`).join("; ") }));

  function addLineItem() {
    const product = products.find((p) => p.id === pickedProduct);
    if (!product || pickedQty < 1) return;
    setLineItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) return prev.map((it) => (it.productId === product.id ? { ...it, qty: it.qty + Number(pickedQty) } : it));
      return [...prev, { productId: product.id, name: product.name, qty: Number(pickedQty), unitPrice: product.sellingPrice, costPrice: product.costPrice, total: product.sellingPrice * Number(pickedQty) }];
    });
    setPickedQty(1);
  }

  function removeLineItem(productId) { setLineItems((prev) => prev.filter((it) => it.productId !== productId)); }

  function resetSaleForm() {
    setLineItems([]); setCustomerName(""); setPaymentMethod(PAYMENT_METHODS[0]);
    setSaleDate(new Date().toISOString().slice(0, 10)); setPickedProduct(products[0]?.id || ""); setPickedQty(1);
  }

  function submitSale() {
    if (lineItems.length === 0) return;
    const totalAmount = lineItems.reduce((a, it) => a + it.total, 0);
    const newSale = {
      id: `s${Date.now()}`, invoiceNumber: `INV-${1000 + sales.length + 1}`, date: saleDate,
      items: lineItems.map((it) => ({ ...it, total: it.qty * it.unitPrice })), totalAmount, paymentMethod, customerName,
    };
    setSales([newSale, ...sales]);
    setProducts(products.map((p) => {
      const sold = lineItems.find((it) => it.productId === p.id);
      if (!sold) return p;
      const stock = Math.max(0, p.stock - sold.qty);
      return { ...p, stock, status: stock === 0 ? "Out of Stock" : "Available" };
    }));
    resetSaleForm();
    setModalOpen(false);
  }

  function confirmDelete() {
    setSales(sales.filter((s) => s.id !== deleteTarget));
    setDeleteTarget(null);
  }

  const lineTotal = lineItems.reduce((a, it) => a + it.total, 0);

  return (
    <div>
      <SectionHeader
        title="Sales"
        subtitle={`${sales.length} invoices on record`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <ExportBar title="Sales" columns={exportColumns} rows={exportRows} filename="sales" onPrint={setPrintData} />
            <PrimaryButton onClick={() => setModalOpen(true)}><Plus size={15} /> New sale</PrimaryButton>
          </div>
        }
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} color={T.brownSoft} style={{ position: "absolute", left: 11, top: 10 }} />
          <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder="Search invoice or customer" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select style={{ ...inputStyle, width: 160 }} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option>All</option><option>Today</option><option>This week</option><option>This month</option><option>This year</option>
        </select>
      </div>

      <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th></th></tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.invoiceNumber}</td>
                  <td style={{ color: T.brownSoft }}>{s.date}</td>
                  <td>{s.customerName || "—"}</td>
                  <td style={{ color: T.brownSoft }}>{s.items.length} item{s.items.length > 1 ? "s" : ""} · {s.items.reduce((a, it) => a + it.qty, 0)} units</td>
                  <td><Badge color={T.brownSoft} bg={T.creamDeep}>{s.paymentMethod}</Badge></td>
                  <td style={{ fontWeight: 600, color: T.clayDeep }}>{money(s.totalAmount)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setViewingSale(s)} style={{ background: "none", border: "none", cursor: "pointer", color: T.brownSoft, padding: 5, fontSize: 12.5, fontWeight: 600 }}>View</button>
                      {perms.deleteRecords && (
                        <button onClick={() => setDeleteTarget(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.rust, padding: 5 }}><Trash2 size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (<tr><td colSpan={7} style={{ textAlign: "center", color: T.brownSoft, padding: 28 }}>No sales match these filters.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title="Record a sale" onClose={() => { setModalOpen(false); resetSaleForm(); }} width={640}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
            <Field label="Date"><input style={inputStyle} type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} /></Field>
            <Field label="Payment method">
              <select style={inputStyle} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => (<option key={m}>{m}</option>))}
              </select>
            </Field>
          </div>
          <Field label="Customer name (optional)"><input style={inputStyle} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in customer" /></Field>

          <div style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: 14, marginBottom: 14, background: T.cream }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: "2 1 200px" }}>
                <label style={labelStyle}>Product</label>
                <select style={inputStyle} value={pickedProduct} onChange={(e) => setPickedProduct(e.target.value)}>
                  {products.map((p) => (<option key={p.id} value={p.id} disabled={p.stock === 0}>{p.name} {p.stock === 0 ? "(out of stock)" : `— ${money(p.sellingPrice)}`}</option>))}
                </select>
              </div>
              <div style={{ flex: "0 1 90px" }}>
                <label style={labelStyle}>Qty</label>
                <input style={inputStyle} type="number" min={1} value={pickedQty} onChange={(e) => setPickedQty(e.target.value)} />
              </div>
              <PrimaryButton onClick={addLineItem} style={{ height: 38 }}><Plus size={14} /> Add</PrimaryButton>
            </div>
          </div>

          {lineItems.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {lineItems.map((it) => (
                <div key={it.productId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.line}` }}>
                  <div style={{ fontSize: 13.5 }}>{it.name} <span style={{ color: T.brownSoft }}>× {it.qty}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{money(it.total)}</span>
                    <button onClick={() => removeLineItem(it.productId)} style={{ background: "none", border: "none", color: T.rust, cursor: "pointer", padding: 2 }}><X size={14} /></button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, fontWeight: 700 }}>
                <span>Total</span><span style={{ color: T.clayDeep }}>{money(lineTotal)}</span>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <GhostButton onClick={() => { setModalOpen(false); resetSaleForm(); }}>Cancel</GhostButton>
            <PrimaryButton onClick={submitSale}><Check size={15} /> Record sale</PrimaryButton>
          </div>
        </Modal>
      )}

      {viewingSale && (
        <Modal title={viewingSale.invoiceNumber} onClose={() => setViewingSale(null)} width={460}>
          <div style={{ fontSize: 13.5, color: T.brownSoft, marginBottom: 12 }}>
            {viewingSale.date} {viewingSale.customerName ? `· ${viewingSale.customerName}` : ""} · {viewingSale.paymentMethod}
          </div>
          {viewingSale.items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.line}`, fontSize: 13.5 }}>
              <span>{it.name} × {it.qty}</span><span style={{ fontWeight: 600 }}>{money(it.total)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, fontWeight: 700, fontSize: 15 }}>
            <span>Total</span><span style={{ color: T.clayDeep }}>{money(viewingSale.totalAmount)}</span>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete sale record" onClose={() => setDeleteTarget(null)} width={420}>
          <p style={{ fontSize: 14, color: T.brownSoft, marginTop: 0 }}>This deletes the invoice permanently. Stock quantities already deducted will not be restored automatically.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <GhostButton onClick={() => setDeleteTarget(null)}>Cancel</GhostButton>
            <PrimaryButton onClick={confirmDelete} style={{ background: T.rust }}><Trash2 size={15} /> Delete</PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}