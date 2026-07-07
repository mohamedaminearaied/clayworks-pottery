import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportBar } from "@/components/ExportBar";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea, Select } from "@/components/ui/forms";
import { ClayBar, SectionHeader } from "@/components/ui/metrics";
import { Pagination } from "@/components/ui/pagination";
import { money, CATEGORY_COLORS, CATEGORIES } from "@/lib/utils";

const emptyProduct = {
  name: "",
  category: CATEGORIES[0],
  sku: "",
  description: "",
  costPrice: "",
  sellingPrice: "",
  stock: "",
  minStock: "",
  supplier: "",
  image: "/unnamed.jpg",
  dateAdded: new Date().toISOString().slice(0, 10),
};

export default function Inventory({ products, setProducts, perms, setPrintData }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase()) ||
        p.supplier.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "Low" && p.stock > 0 && p.stock <= p.minStock) ||
        (stockFilter === "Out" && p.stock === 0) ||
        (stockFilter === "In stock" && p.stock > p.minStock);
      return matchesQuery && matchesCategory && matchesStock;
    });
  }, [products, query, categoryFilter, stockFilter]);

  useEffect(() => {
    setPageIndex(0);
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const exportColumns = [
    { key: "name", label: "Product" },
    { key: "category", label: "Category" },
    { key: "sku", label: "SKU" },
    ...(perms.viewCost ? [{ key: "costPrice", label: "Cost" }] : []),
    { key: "sellingPrice", label: "Price" },
    { key: "stock", label: "Stock" },
    { key: "status", label: "Status" },
    { key: "supplier", label: "Supplier" },
  ];

  const exportRows = filtered.map((p) => ({
    name: p.name,
    category: p.category,
    sku: p.sku,
    costPrice: money(p.costPrice),
    sellingPrice: money(p.sellingPrice),
    stock: p.stock,
    status: p.stock === 0 ? "Out of stock" : p.stock <= p.minStock ? "Low stock" : "Available",
    supplier: p.supplier,
  }));

  function openAdd() {
    setEditing(null);
    setForm(emptyProduct);
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p.id);
    setForm({
      ...p,
      costPrice: String(p.costPrice),
      sellingPrice: String(p.sellingPrice),
      stock: String(p.stock),
      minStock: String(p.minStock),
    });
    setModalOpen(true);
  }

  function saveForm() {
    if (!form.name.trim() || !form.sku.trim()) return;
    const stock = Number(form.stock) || 0;
    const record = {
      ...form,
      costPrice: Number(form.costPrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      stock,
      minStock: Number(form.minStock) || 0,
      image: form.image || "/unnamed.jpg",
      status: stock === 0 ? "Out of Stock" : "Available",
    };
    if (editing) {
      setProducts(products.map((p) => (p.id === editing ? { ...p, ...record, id: editing } : p)));
    } else {
      setProducts([{ ...record, id: `p${Date.now()}` }, ...products]);
    }
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
          <div className="flex flex-wrap items-center gap-3">
            <ExportBar title="Inventory" columns={exportColumns} rows={exportRows} filename="inventory" onPrint={setPrintData} />
            {perms.editInventory && (
              <Button variant="default" className="inline-flex items-center gap-2" onClick={openAdd}>
                <Plus size={15} /> Add product
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-55">
          <Search size={15} className="pointer-events-none absolute left-3 top-3 text-[#6B5544]" />
          <Input className="pl-10" placeholder="Search name, SKU, or supplier" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="shrink-0 min-w-42.5">
          <option>All</option>
          {CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
        </Select>
        <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="shrink-0 min-w-37.5">
          <option>All</option>
          <option>In stock</option>
          <option>Low</option>
          <option>Out</option>
        </Select>
      </div>

      <Card className="border border-[#E2D4BC] bg-[#FFFCF6] shadow-sm">
        <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base text-[#3C2A1E]">Inventory list</CardTitle>
            <p className="text-sm text-[#6B5544]">Browse products by category, stock level, and supplier.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#6B5544]">
            <span>{filtered.length} items</span>
            <span>•</span>
            <span>{pageItems.length} shown</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Product</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Category</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">SKU</th>
                  {perms.viewCost && <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Cost</th>}
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Price</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Stock</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-[#6B5544]">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr key={p.id} className="border-t border-[#E2D4BC] last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 min-w-11 overflow-hidden rounded-2xl bg-[#FEFBF6] sm:h-12 sm:w-12">
                          <img
                            src={p.image || "/unnamed.jpg"}
                            alt={p.name}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src = "/unnamed.jpg";
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-[#3C2A1E]">{p.name}</div>
                          <div className="text-xs text-[#6B5544]">{p.supplier}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><Badge color={CATEGORY_COLORS[p.category] || "#6B5544"} bg={(CATEGORY_COLORS[p.category] || "#6B5544") + "1c"}>{p.category}</Badge></td>
                    <td className="px-4 py-4 text-[#6B5544]">{p.sku}</td>
                    {perms.viewCost && <td className="px-4 py-4">{money(p.costPrice)}</td>}
                    <td className="px-4 py-4 font-semibold text-[#3C2A1E]">{money(p.sellingPrice)}</td>
                    <td className="px-4 py-4"><ClayBar value={p.stock} max={Math.max(p.minStock * 3, p.stock, 10)} tone={p.stock === 0 ? "danger" : p.stock <= p.minStock ? "warn" : "ok"} /></td>
                    <td className="px-4 py-4">
                      {p.stock === 0 ? (
                        <Badge color="#9C3B2A" bg="#F4DCD5">Out of stock</Badge>
                      ) : p.stock <= p.minStock ? (
                        <Badge color="#93481D" bg="#F3E5CB">Low stock</Badge>
                      ) : (
                        <Badge color="#465634" bg="#E4EAD9">Available</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-[#6B5544] transition hover:bg-[#F6EFE3]">
                          <Pencil size={15} />
                        </button>
                        {perms.deleteRecords && (
                          <button onClick={() => setDeleteTarget(p.id)} className="rounded-lg p-2 text-[#9C3B2A] transition hover:bg-[#F6EFE3]">
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
              pageItems.map((p) => (
                <Card key={p.id} className="border border-[#E2D4BC] bg-[#FEFBF6]">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 min-w-16 shrink-0 overflow-hidden rounded-2xl bg-[#FEFBF6] sm:h-20 sm:w-20">
                          <img
                            src={p.image || "/unnamed.jpg"}
                            alt={p.name}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src = "/unnamed.jpg";
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#3C2A1E]">{p.name}</p>
                          <p className="text-xs text-[#6B5544]">{p.sku} · {p.supplier}</p>
                        </div>
                      </div>
                      <Badge color={CATEGORY_COLORS[p.category] || "#6B5544"} bg={(CATEGORY_COLORS[p.category] || "#6B5544") + "1c"}>{p.category}</Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/90 p-3 text-sm text-[#6B5544]">
                        <div className="text-[13px] uppercase tracking-[0.08em] text-[#6B5544]">Price</div>
                        <div className="mt-1 font-semibold text-[#3C2A1E]">{money(p.sellingPrice)}</div>
                      </div>
                      <div className="rounded-2xl bg-white/90 p-3 text-sm text-[#6B5544]">
                        <div className="text-[13px] uppercase tracking-[0.08em] text-[#6B5544]">Stock</div>
                        <div className="mt-1 font-semibold text-[#3C2A1E]">{p.stock}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        {p.stock === 0 ? (
                          <Badge color="#9C3B2A" bg="#F4DCD5">Out of stock</Badge>
                        ) : p.stock <= p.minStock ? (
                          <Badge color="#93481D" bg="#F3E5CB">Low stock</Badge>
                        ) : (
                          <Badge color="#465634" bg="#E4EAD9">Available</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="rounded-lg border border-[#E2D4BC] bg-white px-3 py-2 text-sm text-[#6B5544] transition hover:bg-[#F6EFE3]">Edit</button>
                        {perms.deleteRecords && (
                          <button onClick={() => setDeleteTarget(p.id)} className="rounded-lg border border-[#E2D4BC] bg-white px-3 py-2 text-sm text-[#9C3B2A] transition hover:bg-[#F6EFE3]">Delete</button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="rounded-3xl border border-[#E2D4BC] bg-[#FFFCF6] p-5 text-center text-sm text-[#6B5544]">No products match these filters.</div>
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
        <Modal title={editing ? "Edit product" : "Add product"} onClose={() => setModalOpen(false)} width={560}>
          <div className="grid gap-3 md:grid-cols-2 md:gap-x-4">
            <Field label="Product name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Terracotta amphora vase" />
            </Field>
            <Field label="SKU / code">
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="VAS-101" />
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
              </Select>
            </Field>
            <Field label="Supplier">
              <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Sfax Clay Works" />
            </Field>
            <Field label="Cost price">
              <Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="0" />
            </Field>
            <Field label="Selling price">
              <Input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="0" />
            </Field>
            <Field label="Stock quantity">
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
            </Field>
            <Field label="Minimum stock level">
              <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="0" />
            </Field>
          </div>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description of the piece" className="min-h-16 resize-vertical" />
          </Field>
          <div className="mt-4 flex flex-col gap-3 justify-end sm:flex-row">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={saveForm} className="inline-flex items-center gap-2">
              <span>Add product</span>
            </Button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Remove product" onClose={() => setDeleteTarget(null)} width={420}>
          <p className="text-sm text-[#6B5544]">This removes the product from inventory permanently. Past sales and purchase records are unaffected.</p>
          <div className="mt-4 flex flex-col gap-3 justify-end sm:flex-row">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="inline-flex items-center gap-2">
              <Trash2 size={15} /> Remove
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
