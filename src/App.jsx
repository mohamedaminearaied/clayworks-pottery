import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Purchases from "@/pages/Purchases";
import Sales from "@/pages/Sales";
import { PrintArea } from "@/components/PrintArea";
import { loadKey, saveKey, clearKey } from "@/lib/utils";
import { seedProducts, seedSales, seedPurchases, seedUsers, permissionsFor } from "@/lib/data";

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
    const timer = setTimeout(() => {
      window.print();
      setPrintData(null);
    }, 60);
    return () => clearTimeout(timer);
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
      <div className="flex h-100 items-center justify-center text-[#6B5544] font-sans">
        Loading the studio ledger…
      </div>
    );
  }

  if (!session) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  const perms = permissionsFor(session.role);

  return (
    <SidebarProvider>
      <div className="relative min-h-screen w-full overflow-hidden rounded-[1.125rem] border border-[#E2D4BC] bg-[#F6EFE3] text-[#3C2A1E] shadow-sm">
        <PrintArea data={printData} />
        <AppSidebar
          view={view}
          setView={setView}
          lowStockCount={products.filter((p) => p.stock <= p.minStock).length}
          session={session}
          onLogout={handleLogout}
        />
        <div className="md:pl-72">
          <div className="flex items-center justify-between gap-3 border-b border-[#E2D4BC] bg-[#FEFBF6] px-4 py-3 md:hidden">
            <SidebarTrigger />
            <div className="text-sm font-semibold text-[#3C2A1E]">Ember & Clay</div>
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto px-4 py-6 md:px-8 md:py-7">
            {view === "dashboard" && <Dashboard products={products} sales={sales} purchases={purchases} setView={setView} perms={perms} />}
            {view === "inventory" && <Inventory products={products} setProducts={updateProducts} perms={perms} setPrintData={setPrintData} />}
            {view === "sales" && <Sales sales={sales} setSales={updateSales} products={products} setProducts={updateProducts} perms={perms} setPrintData={setPrintData} />}
            {view === "purchases" && <Purchases purchases={purchases} setPurchases={updatePurchases} products={products} setProducts={updateProducts} perms={perms} setPrintData={setPrintData} />}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
