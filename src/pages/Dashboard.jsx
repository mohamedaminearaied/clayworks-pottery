import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, DollarSign, Boxes, ShoppingBag, Truck, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard, DashboardHero, MiniMetric, SectionHeader } from "@/components/ui/metrics";
import { money, CATEGORY_COLORS } from "@/lib/utils";
import { T } from "@/lib/theme";

export default function Dashboard({ products, sales, purchases, setView, perms }) {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const totalProfit = sales.reduce(
      (acc, sale) =>
        acc + sale.items.reduce((inner, item) => inner + (item.unitPrice - item.costPrice) * item.qty, 0),
      0
    );
    const totalSalesCount = sales.length;
    const productsSold = sales.reduce((acc, sale) => acc + sale.items.reduce((inner, item) => inner + item.qty, 0), 0);
    const inventoryValue = products.reduce((acc, product) => acc + product.stock * product.costPrice, 0);
    const productsInStock = products.reduce((acc, product) => acc + product.stock, 0);
    const lowStock = products.filter((product) => product.stock > 0 && product.stock <= product.minStock);
    const outOfStock = products.filter((product) => product.stock === 0);
    const totalPurchaseCost = purchases.reduce((acc, purchase) => acc + purchase.totalCost, 0);

    return {
      totalRevenue,
      totalProfit,
      totalSalesCount,
      productsSold,
      inventoryValue,
      productsInStock,
      lowStock,
      outOfStock,
      totalPurchaseCost,
    };
  }, [products, sales, purchases]);

  const monthly = useMemo(() => {
    const monthMap = {};
    sales.forEach((sale) => {
      const date = new Date(sale.date);
      const monthKey = date.toLocaleString("en-US", { month: "short" });
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { month: monthKey, revenue: 0, profit: 0, order: date.getMonth() };
      }
      monthMap[monthKey].revenue += sale.totalAmount;
      monthMap[monthKey].profit += sale.items.reduce((inner, item) => inner + (item.unitPrice - item.costPrice) * item.qty, 0);
    });
    return Object.values(monthMap).sort((a, b) => a.order - b.order);
  }, [sales]);

  const bestSellers = useMemo(() => {
    const productMap = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = { name: item.name, qty: 0, revenue: 0 };
        }
        productMap[item.productId].qty += item.qty;
        productMap[item.productId].revenue += item.total;
      });
    });
    return Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [sales]);

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [sales]
  );

  const categoryDist = useMemo(() => {
    const categoryMap = {};
    products.forEach((product) => {
      categoryMap[product.category] = (categoryMap[product.category] || 0) + product.stock;
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [products]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard" subtitle="Today's snapshot of the storefront's health." />

      <DashboardHero
        title="Run the studio with calm focus"
        description="Track sales, stock, and supplier flow from a single responsive studio dashboard."
        icon={Flame}
        actions={[
          <Button key="inventory-cta" variant="secondary" className="h-11 w-full sm:w-auto px-5" onClick={() => setView("inventory") }>
            Review inventory
          </Button>,
          <Button key="sales-cta" variant="ghost" className="h-11 w-full sm:w-auto px-5 text-[#C1622B]" onClick={() => setView("sales") }>
            Record sale
          </Button>,
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MiniMetric label="Low stock items" value={stats.lowStock.length + stats.outOfStock.length} note="Restock or reorder soon" tone="danger" />
        <MiniMetric label="Pending purchases" value={purchases.length} note="Supplier orders on file" tone="primary" />
        <MiniMetric label="Current revenue" value={money(stats.totalRevenue)} note={`${stats.totalSalesCount} invoices`} tone="success" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-[#E2D4BC] bg-white/95 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="text-base font-semibold text-[#3C2A1E]">Monthly revenue</h4>
            <Badge color={T.clayDeep} bg={T.creamDeep}>Trend</Badge>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: T.brownSoft }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: T.brownSoft }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 10, fontSize: 13 }} formatter={(value) => money(value)} />
              <Bar dataKey="revenue" fill={T.clay} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-[#E2D4BC] bg-white/95 p-5 shadow-sm">
          <h4 className="mb-4 text-base font-semibold text-[#3C2A1E]">Stock by category</h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryDist} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={4}>
                {categoryDist.map((item, index) => (
                  <Cell key={index} fill={CATEGORY_COLORS[item.name] || T.brownSoft} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#6B5544]">
            {categoryDist.map((category) => (
              <span key={category.name} className="rounded-full border border-[#E2D4BC] bg-[#FCF7EE] px-3 py-1">{category.name}</span>
            ))}
          </div>
        </div>
      </div>

      {perms.viewProfit && (
        <div className="rounded-3xl border border-[#E2D4BC] bg-white/95 p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-base font-semibold text-[#3C2A1E]">Revenue vs profit trend</h4>
            <div className="flex items-center gap-3 text-sm text-[#6B5544]">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#C1622B]" />Revenue</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#465634]" />Profit</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: T.brownSoft }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: T.brownSoft }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 10, fontSize: 13 }} formatter={(value) => money(value)} />
              <Line type="monotone" dataKey="revenue" stroke={T.clay} strokeWidth={2.5} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="profit" stroke={T.sage} strokeWidth={2.5} dot={false} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#E2D4BC] bg-white/95 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="text-base font-semibold text-[#3C2A1E]">Best sellers</h4>
            <Badge color={T.gold} bg={T.goldFaint}>{bestSellers.length} top items</Badge>
          </div>
          <div className="space-y-3">
            {bestSellers.length > 0 ? (
              bestSellers.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-4 rounded-3xl border border-[#F0E7D8] bg-[#FEFBF6] p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#E4EAD9] text-[#3C2A1E] text-xs font-bold">{index + 1}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#3C2A1E]">{item.name}</p>
                      <p className="text-xs text-[#6B5544]">{item.qty} sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#C1622B]">{money(item.revenue)}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-[#6B5544]">No sales recorded yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[#E2D4BC] bg-white/95 p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-base font-semibold text-[#3C2A1E]">Recent sales</h4>
            <Button variant="ghost" className="w-full text-left text-sm font-semibold text-[#C1622B] hover:bg-[#F6EFE3] sm:w-auto sm:text-right">Go to sales →</Button>
          </div>
          <div className="space-y-3">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex flex-col gap-1 rounded-3xl border border-[#F0E7D8] bg-[#FEFBF6] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#3C2A1E]">{sale.invoiceNumber}</p>
                    <p className="text-xs text-[#6B5544]">{sale.date}{sale.customerName ? ` · ${sale.customerName}` : ""}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#C1622B]">{money(sale.totalAmount)}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-[#6B5544]">No sales yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#E2D4BC] bg-white/95 p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-base font-semibold text-[#3C2A1E]">Low stock alerts</h4>
          {stats.lowStock.length + stats.outOfStock.length > 0 && (
            <Badge color={T.rust} bg={T.rustFaint}>{stats.lowStock.length + stats.outOfStock.length} items</Badge>
          )}
        </div>
        <div className="space-y-3">
          {[...stats.outOfStock, ...stats.lowStock].slice(0, 6).map((product) => (
            <div key={product.id} className="flex flex-col gap-2 rounded-3xl border border-[#F0E7D8] bg-[#FEFBF6] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <AlertTriangle size={16} color={product.stock === 0 ? T.rust : T.gold} />
                <div>
                  <p className="truncate text-sm font-semibold text-[#3C2A1E]">{product.name}</p>
                  <p className="text-xs text-[#6B5544]">{product.stock === 0 ? "Out of stock" : `${product.stock} left`}</p>
                </div>
              </div>
              <Badge color={product.stock === 0 ? T.rust : T.clayDeep} bg={product.stock === 0 ? T.rustFaint : T.goldFaint}>
                {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
              </Badge>
            </div>
          ))}
          {stats.lowStock.length + stats.outOfStock.length === 0 && <div className="text-sm text-[#6B5544]">Every product is comfortably stocked.</div>}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" className="px-0 text-sm font-semibold text-[#C1622B] hover:bg-[#F6EFE3]">Go to inventory →</Button>
        </div>
      </div>
    </div>
  );
}
