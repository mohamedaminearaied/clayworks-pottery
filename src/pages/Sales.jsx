import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportBar } from "@/components/ExportBar";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/forms";
import { Pagination } from "@/components/ui/pagination";
import { SectionHeader } from "@/components/ui/metrics";
import { money, PAYMENT_METHODS } from "@/lib/utils";

export default function Sales({ sales, setSales, products, setProducts, perms, setPrintData }) {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [lineItems, setLineItems] = useState([]);
  const [pickedProduct, setPickedProduct] = useState(products[0]?.id || "");
  const [pickedQty, setPickedQty] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));

  const filtered = useMemo(() => {
    const now = new Date(2026, 6, 6);
    return sales.filter((s) => {
      const matchesQuery =
        !query ||
        s.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
        (s.customerName || "").toLowerCase().includes(query.toLowerCase());
      let matchesDate = true;
      const d = new Date(s.date);
      if (dateFilter === "Today") matchesDate = s.date === now.toISOString().slice(0, 10);
      if (dateFilter === "This week") matchesDate = now - d <= 7 * 86400000 && d <= now;
      if (dateFilter === "This month") matchesDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (dateFilter === "This year") matchesDate = d.getFullYear() === now.getFullYear();
      return matchesQuery && matchesDate;
    });
  }, [sales, query, dateFilter]);

  useEffect(() => {
    setPageIndex(0);
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const exportColumns = [
    { key: "invoiceNumber", label: "Invoice" },
    { key: "date", label: "Date" },
    { key: "customerName", label: "Customer" },
    { key: "itemsSummary", label: "Items" },
    { key: "paymentMethod", label: "Payment" },
    { key: "totalAmount", label: "Total" },
  ];
  const exportRows = filtered.map((s) => ({ ...s, itemsSummary: s.items.map((it) => `${it.name} x${it.qty}`).join("; ") }));

  function addLineItem() {
    const product = products.find((p) => p.id === pickedProduct);
    if (!product || pickedQty < 1) return;
    setLineItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        return prev.map((it) =>
          it.productId === product.id ? { ...it, qty: it.qty + Number(pickedQty), total: (it.qty + Number(pickedQty)) * it.unitPrice } : it
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          qty: Number(pickedQty),
          unitPrice: product.sellingPrice,
          costPrice: product.costPrice,
          total: product.sellingPrice * Number(pickedQty),
        },
      ];
    });
    setPickedQty(1);
  }

  function removeLineItem(productId) {
    setLineItems((prev) => prev.filter((it) => it.productId !== productId));
  }

  function resetSaleForm() {
    setLineItems([]);
    setCustomerName("");
    setPaymentMethod(PAYMENT_METHODS[0]);
    setSaleDate(new Date().toISOString().slice(0, 10));
    setPickedProduct(products[0]?.id || "");
    setPickedQty(1);
  }

  function submitSale() {
    if (lineItems.length === 0) return;
    const totalAmount = lineItems.reduce((a, it) => a + it.total, 0);
    const newSale = {
      id: `s${Date.now()}`,
      invoiceNumber: `INV-${1000 + sales.length + 1}`,
      date: saleDate,
      items: lineItems.map((it) => ({ ...it, total: it.qty * it.unitPrice })),
      totalAmount,
      paymentMethod,
      customerName,
    };
    setSales([newSale, ...sales]);
    setProducts(
      products.map((p) => {
        const sold = lineItems.find((it) => it.productId === p.id);
        if (!sold) return p;
        const stock = Math.max(0, p.stock - sold.qty);
        return { ...p, stock, status: stock === 0 ? "Out of Stock" : "Available" };
      })
    );
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
          <div className="flex flex-wrap items-center gap-3">
            <ExportBar title="Sales" columns={exportColumns} rows={exportRows} filename="sales" onPrint={setPrintData} />
            <Button variant="default" className="inline-flex items-center gap-2" onClick={() => setModalOpen(true)}>
              <Plus size={15} /> New sale
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-55">
          <Search size={15} className="pointer-events-none absolute left-3 top-3 text-[#6B5544]" />
          <Input className="pl-10" placeholder="Search invoice or customer" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="shrink-0 min-w-40">
          <option>All</option>
          <option>Today</option>
          <option>This week</option>
          <option>This month</option>
          <option>This year</option>
        </Select>
      </div>

      <Card className="border border-[#E2D4BC] bg-[#FFFCF6] shadow-sm">
        <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base text-[#3C2A1E]">Sales history</CardTitle>
            <p className="text-sm text-[#6B5544]">Review invoices, payment status, and customer activity.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#6B5544]">
            <span>{filtered.length} records</span>
            <span>•</span>
            <span>{pageItems.length} shown</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Invoice</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Date</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Customer</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Items</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Payment</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((s) => (
                  <tr key={s.id} className="border-t border-[#E2D4BC] last:border-b-0">
                    <td className="px-4 py-4 font-semibold text-[#3C2A1E]">{s.invoiceNumber}</td>
                    <td className="px-4 py-4 text-[#6B5544]">{s.date}</td>
                    <td className="px-4 py-4">{s.customerName || "—"}</td>
                    <td className="px-4 py-4 text-[#6B5544]">{s.items.length} item{s.items.length > 1 ? "s" : ""} · {s.items.reduce((a, it) => a + it.qty, 0)} units</td>
                    <td className="px-4 py-4"><Badge color="#6B5544" bg="#F6EFE3">{s.paymentMethod}</Badge></td>
                    <td className="px-4 py-4 font-semibold text-[#93481D]">{money(s.totalAmount)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setViewingSale(s)} className="rounded-lg px-2 py-1 text-[0.8rem] font-semibold text-[#6B5544] transition hover:bg-[#F6EFE3]">View</button>
                        {perms.deleteRecords && (
                          <button onClick={() => setDeleteTarget(s.id)} className="rounded-lg p-2 text-[#9C3B2A] transition hover:bg-[#F6EFE3]">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 p-4 md:hidden">
            {pageItems.length > 0 ? (
              pageItems.map((s) => (
                <Card key={s.id} className="border border-[#E2D4BC] bg-[#FEFBF6]">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#3C2A1E]">{s.invoiceNumber}</p>
                        <p className="text-xs text-[#6B5544]">{s.date}{s.customerName ? ` · ${s.customerName}` : ""}</p>
                      </div>
                      <Badge color="#6B5544" bg="#F6EFE3">{s.paymentMethod}</Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/90 p-3 text-sm text-[#6B5544]">
                        <div className="text-[13px] uppercase tracking-[0.08em]">Items</div>
                        <div className="mt-1 font-semibold text-[#3C2A1E]">{s.items.length}</div>
                      </div>
                      <div className="rounded-2xl bg-white/90 p-3 text-sm text-[#6B5544]">
                        <div className="text-[13px] uppercase tracking-[0.08em]">Total</div>
                        <div className="mt-1 font-semibold text-[#3C2A1E]">{money(s.totalAmount)}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setViewingSale(s)} className="rounded-lg border border-[#E2D4BC] bg-white px-3 py-2 text-sm text-[#6B5544] transition hover:bg-[#F6EFE3]">View</button>
                      {perms.deleteRecords && (
                        <button onClick={() => setDeleteTarget(s.id)} className="rounded-lg border border-[#E2D4BC] bg-white px-3 py-2 text-sm text-[#9C3B2A] transition hover:bg-[#F6EFE3]">Delete</button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="rounded-3xl border border-[#E2D4BC] bg-[#FFFCF6] p-5 text-center text-sm text-[#6B5544]">No sales match these filters.</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-4 py-4">
          <Pagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            pageSize={pageSize}
            onPageChange={(newPage) => setPageIndex(newPage)}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
          />
        </CardFooter>
      </Card>

      {modalOpen && (
        <Modal title="Record a sale" onClose={() => { setModalOpen(false); resetSaleForm(); }} width={640}>
          <div className="grid gap-3 md:grid-cols-2 md:gap-x-4">
            <Field label="Date">
              <Input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
            </Field>
            <Field label="Payment method">
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Customer name (optional)">
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in customer" />
          </Field>

          <div className="mb-4 rounded-2xl border border-[#E2D4BC] bg-[#EEE2CC] p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-50 flex-1">
                <label className="mb-2 block text-sm font-semibold text-[#6B5544]">Product</label>
                <Select value={pickedProduct} onChange={(e) => setPickedProduct(e.target.value)}>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock === 0}>
                      {p.name} {p.stock === 0 ? "(out of stock)" : `— ${money(p.sellingPrice)}`}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-22.5">
                <label className="mb-2 block text-sm font-semibold text-[#6B5544]">Qty</label>
                <Input type="number" min={1} value={pickedQty} onChange={(e) => setPickedQty(e.target.value)} />
              </div>
              <Button variant="default" className="h-10 inline-flex items-center gap-2" onClick={addLineItem}>
                <Plus size={14} /> Add
              </Button>
            </div>
          </div>

          {lineItems.length > 0 && (
            <div className="mb-4 space-y-3">
              {lineItems.map((it) => (
                <div key={it.productId} className="flex items-center justify-between border-b border-[#E2D4BC] py-2">
                  <div className="text-sm">
                    {it.name} <span className="text-[#6B5544]">× {it.qty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{money(it.total)}</span>
                    <button onClick={() => removeLineItem(it.productId)} className="rounded-lg p-1 text-[#9C3B2A] transition hover:bg-[#F6EFE3]">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-semibold">
                <span>Total</span>
                <span className="text-[#C1622B]">{money(lineTotal)}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 justify-end sm:flex-row">
            <Button variant="ghost" onClick={() => { setModalOpen(false); resetSaleForm(); }}>
              Cancel
            </Button>
            <Button variant="default" onClick={submitSale} className="inline-flex items-center gap-2">
              <span>Record sale</span>
            </Button>
          </div>
        </Modal>
      )}

      {viewingSale && (
        <Modal title={viewingSale.invoiceNumber} onClose={() => setViewingSale(null)} width={460}>
          <div className="mb-3 text-sm text-[#6B5544]">
            {viewingSale.date} {viewingSale.customerName ? `· ${viewingSale.customerName}` : ""} · {viewingSale.paymentMethod}
          </div>
          {viewingSale.items.map((it, i) => (
            <div key={i} className="flex justify-between border-b border-[#E2D4BC] py-2 text-sm">
              <span>{it.name} × {it.qty}</span>
              <span className="font-semibold">{money(it.total)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-semibold text-base">
            <span>Total</span>
            <span className="text-[#C1622B]">{money(viewingSale.totalAmount)}</span>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete sale record" onClose={() => setDeleteTarget(null)} width={420}>
          <p className="mt-0 text-sm text-[#6B5544]">This deletes the invoice permanently. Stock quantities already deducted will not be restored automatically.</p>
          <div className="mt-4 flex flex-col gap-3 justify-end sm:flex-row">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="inline-flex items-center gap-2">
              <Trash2 size={15} /> Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
