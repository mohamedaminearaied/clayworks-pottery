import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportBar } from "@/components/ExportBar";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Textarea, Select, Checkbox } from "@/components/ui/forms";
import { Pagination } from "@/components/ui/pagination";
import { SectionHeader } from "@/components/ui/metrics";
import { money, PAYMENT_METHODS, SUPPLIERS } from "@/lib/utils";

export default function Purchases({ purchases, setPurchases, products, setProducts, perms, setPrintData }) {
  const [query, setQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(10);
  const [purchasePrice, setPurchasePrice] = useState(products[0]?.costPrice || 0);
  const [supplier, setSupplier] = useState(products[0]?.supplier || SUPPLIERS[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [updateCost, setUpdateCost] = useState(true);

  const filtered = useMemo(() => {
    return purchases.filter((pu) => {
      const matchesQuery =
        !query ||
        pu.productName.toLowerCase().includes(query.toLowerCase()) ||
        pu.supplier.toLowerCase().includes(query.toLowerCase());
      const matchesSupplier = supplierFilter === "All" || pu.supplier === supplierFilter;
      return matchesQuery && matchesSupplier;
    });
  }, [purchases, query, supplierFilter]);

  useEffect(() => {
    setPageIndex(0);
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const exportColumns = [
    { key: "supplier", label: "Supplier" },
    { key: "productName", label: "Product" },
    { key: "quantity", label: "Quantity" },
    { key: "purchasePrice", label: "Unit cost" },
    { key: "totalCost", label: "Total cost" },
    { key: "date", label: "Date" },
    { key: "notes", label: "Notes" },
  ];

  function onProductChange(id) {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (p) {
      setPurchasePrice(p.costPrice);
      setSupplier(p.supplier);
    }
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
      id: `pu${Date.now()}`,
      supplier,
      productId,
      productName: product.name,
      quantity: qty,
      purchasePrice: price,
      totalCost: qty * price,
      date,
      notes,
    };
    setPurchases([record, ...purchases]);
    setProducts(
      products.map((p) => {
        if (p.id !== productId) return p;
        const stock = p.stock + qty;
        return { ...p, stock, status: "Available", costPrice: updateCost ? price : p.costPrice };
      })
    );
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
          <div className="flex flex-wrap items-center gap-3">
            <ExportBar title="Purchase history" columns={exportColumns} rows={filtered} filename="purchases" onPrint={setPrintData} />
            {perms.managePurchases && (
              <Button variant="default" className="inline-flex items-center gap-2" onClick={() => setModalOpen(true)}>
                <Plus size={15} /> Record purchase
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-55">
          <Search size={15} className="pointer-events-none absolute left-3 top-3 text-[#6B5544]" />
          <Input className="pl-10" placeholder="Search product or supplier" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="shrink-0 min-w-50">
          <option>All</option>
          {SUPPLIERS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </div>

      <Card className="border border-[#E2D4BC] bg-[#FFFCF6] shadow-sm">
        <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base text-[#3C2A1E]">Purchase orders</CardTitle>
            <p className="text-sm text-[#6B5544]">Track incoming stock and supplier orders with responsive cards.</p>
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
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Supplier</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Product</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Quantity</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Unit cost</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Total cost</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((pu) => (
                  <tr key={pu.id} className="border-t border-[#E2D4BC] last:border-b-0">
                    <td className="px-4 py-4 text-[#3C2A1E]">{pu.supplier}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-[#FEFBF6]">
                          <img
                            src={products.find((p) => p.id === pu.productId)?.image || "/unnamed.jpg"}
                            alt={pu.productName}
                            loading="lazy"
                            onError={(event) => { event.currentTarget.src = "/unnamed.jpg"; }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-[#3C2A1E]">{pu.productName}</div>
                          <div className="text-xs text-[#6B5544]">Qty {pu.quantity}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{pu.quantity}</td>
                    <td className="px-4 py-4">{money(pu.purchasePrice)}</td>
                    <td className="px-4 py-4 font-semibold text-[#93481D]">{money(pu.totalCost)}</td>
                    <td className="px-4 py-4 text-[#6B5544]">{pu.date}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setViewingPurchase(pu)} className="rounded-lg px-2 py-1 text-[0.8rem] font-semibold text-[#6B5544] transition hover:bg-[#F6EFE3]">View</button>
                        {perms.deleteRecords && (
                          <button onClick={() => setDeleteTarget(pu.id)} className="rounded-lg p-2 text-[#9C3B2A] transition hover:bg-[#F6EFE3]">
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
              pageItems.map((pu) => (
                <Card key={pu.id} className="border border-[#E2D4BC] bg-[#FEFBF6]">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#FEFBF6]">
                          <img
                            src={products.find((p) => p.id === pu.productId)?.image || "/unnamed.jpg"}
                            alt={pu.productName}
                            loading="lazy"
                            onError={(event) => { event.currentTarget.src = "/unnamed.jpg"; }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#3C2A1E]">{pu.productName}</p>
                          <p className="text-xs text-[#6B5544]">{pu.supplier}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#93481D]">{money(pu.totalCost)}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/90 p-3 text-sm text-[#6B5544]">
                        <div className="text-[13px] uppercase tracking-[0.08em]">Quantity</div>
                        <div className="mt-1 font-semibold text-[#3C2A1E]">{pu.quantity}</div>
                      </div>
                      <div className="rounded-2xl bg-white/90 p-3 text-sm text-[#6B5544]">
                        <div className="text-[13px] uppercase tracking-[0.08em]">Unit cost</div>
                        <div className="mt-1 font-semibold text-[#3C2A1E]">{money(pu.purchasePrice)}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-[#6B5544]">{pu.date}</div>
                      <div className="flex gap-2">
                        <button onClick={() => setViewingPurchase(pu)} className="rounded-lg border border-[#E2D4BC] bg-white px-3 py-2 text-sm text-[#6B5544] transition hover:bg-[#F6EFE3]">View</button>
                        {perms.deleteRecords && (
                          <button onClick={() => setDeleteTarget(pu.id)} className="rounded-lg border border-[#E2D4BC] bg-white px-3 py-2 text-sm text-[#9C3B2A] transition hover:bg-[#F6EFE3]">Delete</button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="rounded-3xl border border-[#E2D4BC] bg-[#FFFCF6] p-5 text-center text-sm text-[#6B5544]">No purchases match these filters.</div>
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
        <Modal title="Record a purchase" onClose={() => { setModalOpen(false); resetForm(); }} width={560}>
          <div className="grid gap-3 md:grid-cols-2 md:gap-x-4">
            <Field label="Product">
              <Select value={productId} onChange={(e) => onProductChange(e.target.value)}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Supplier">
              <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} list="supplier-list" />
              <datalist id="supplier-list">
                {SUPPLIERS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field label="Quantity purchased">
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </Field>
            <Field label="Purchase price (per unit)">
              <Input type="number" min={0} value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
            </Field>
            <Field label="Purchase date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Total cost">
              <div className="min-h-11 w-full rounded-2xl border border-[#E2D4BC] bg-[#EEE2CC] px-4 py-3 text-sm font-semibold text-[#3C2A1E]">
                {money((Number(quantity) || 0) * (Number(purchasePrice) || 0))}
              </div>
            </Field>
          </div>
          <Field label="Notes (optional)">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Bulk order, restock, new glaze batch…" className="min-h-14 resize-vertical" />
          </Field>
          <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-[#6B5544]">
            <Checkbox checked={updateCost} onChange={(e) => setUpdateCost(e.target.checked)} />
            Update this product's cost price to match this purchase
          </label>
          <div className="flex flex-col gap-3 justify-end sm:flex-row">
            <Button variant="ghost" onClick={() => { setModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="default" onClick={submitPurchase} className="inline-flex items-center gap-2">
              <span>Record purchase</span>
            </Button>
          </div>
        </Modal>
      )}

      {viewingPurchase && (
        <Modal title="Purchase details" onClose={() => setViewingPurchase(null)} width={420}>
          <div className="space-y-2 text-sm leading-7">
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
          <p className="mt-0 text-sm text-[#6B5544]">This deletes the purchase order permanently. Stock already added will not be reversed automatically.</p>
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
