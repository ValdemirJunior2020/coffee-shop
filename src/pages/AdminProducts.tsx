import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Product = {
  id: string;
  title: string;
  basePrice: number; // Temu price
  description: string;
  images: string; // comma-separated paths e.g. /first.png,/second.png
  active: boolean;
  createdAt: string;
};

const ADMIN_KEY = "coffee_shop_admin_authed_v1";
const PRODUCTS_KEY = "coffee_shop_products_v1";
const MAX_PRODUCTS = 5;

// +50% margin
const sellPrice = (base: number) => Math.round(base * 1.5 * 100) / 100;

function loadProducts(): Product[] {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `p_${Date.now()}_${Math.random()}`;
}

export default function AdminProducts() {
  const nav = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [basePrice, setBasePrice] = useState<string>(""); // keep as string for input
  const [description, setDescription] = useState("");
  const [images, setImages] = useState(""); // "/first.png,/second.png"
  const [active, setActive] = useState(true);

  // auth guard
  useEffect(() => {
    const authed = localStorage.getItem(ADMIN_KEY) === "true";
    if (!authed) nav("/admin/login");
  }, [nav]);

  // load products on mount
  useEffect(() => {
    setProducts(loadProducts());
  }, []);

  const remaining = useMemo(() => MAX_PRODUCTS - products.length, [products.length]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBasePrice("");
    setDescription("");
    setImages("");
    setActive(true);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setTitle(p.title);
    setBasePrice(String(p.basePrice));
    setDescription(p.description);
    setImages(p.images);
    setActive(p.active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSave = () => {
    const bp = Number(basePrice);
    if (!title.trim()) return alert("Title is required.");
    if (!Number.isFinite(bp) || bp <= 0) return alert("Base price must be a valid number > 0.");
    if (!description.trim()) return alert("Description is required.");
    if (!images.trim()) return alert("Images are required. Example: /first.png,/second.png");

    // enforce max products only when adding new
    if (!editingId && products.length >= MAX_PRODUCTS) {
      return alert(`You can only add up to ${MAX_PRODUCTS} products.`);
    }

    const next: Product[] = editingId
      ? products.map((p) =>
          p.id === editingId
            ? { ...p, title: title.trim(), basePrice: bp, description: description.trim(), images: images.trim(), active }
            : p
        )
      : [
          ...products,
          {
            id: uid(),
            title: title.trim(),
            basePrice: bp,
            description: description.trim(),
            images: images.trim(),
            active,
            createdAt: new Date().toISOString(),
          },
        ];

    setProducts(next);
    saveProducts(next);
    resetForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = (id: string) => {
    const ok = confirm("Delete this product?");
    if (!ok) return;
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    saveProducts(next);
    if (editingId === id) resetForm();
  };

  const onLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    nav("/admin/login");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Admin • Products</h1>
          <p className="text-zinc-600">
            Add / edit / delete products. Max <b>{MAX_PRODUCTS}</b>. Sell price auto = base +50%.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-full border px-5 py-2 font-semibold hover:border-purple-700 hover:text-purple-700"
            onClick={() => nav("/")}
          >
            View Store
          </button>
          <button
            className="rounded-full bg-purple-700 text-white px-5 py-2 font-semibold hover:bg-purple-800"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="border rounded-2xl p-5 bg-white">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>
          <div className="text-sm text-zinc-600">
            Remaining slots: <b>{remaining}</b>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Title</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product title..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Base Price (Temu)</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="76.49"
              inputMode="decimal"
            />
            <div className="text-xs text-zinc-500 mt-1">
              Sell price will be:{" "}
              <b>
                {Number.isFinite(Number(basePrice)) && Number(basePrice) > 0
                  ? `$${sellPrice(Number(basePrice)).toFixed(2)}`
                  : "$—"}
              </b>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Active</label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span className="text-sm text-zinc-700">
                Visible in store
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 min-h-[110px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">
              Images (comma-separated public paths)
            </label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder="/first.png,/second.png,/third.png"
            />
            <div className="text-xs text-zinc-500 mt-1">
              Example: <b>/product-2.png,/product-2-1.png,/product-2-2.png</b>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            className="rounded-full bg-purple-700 text-white px-6 py-3 font-semibold hover:bg-purple-800"
            onClick={onSave}
          >
            {editingId ? "Save Changes" : "Add Product"}
          </button>

          <button
            className="rounded-full border px-6 py-3 font-semibold hover:border-purple-700 hover:text-purple-700"
            onClick={resetForm}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-2xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-xl font-extrabold">Saved Products</h2>
          <p className="text-sm text-zinc-600">
            These are stored locally for now. Next step we will connect Supabase.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr className="text-left">
                <th className="p-3">Preview</th>
                <th className="p-3">Title</th>
                <th className="p-3">Base</th>
                <th className="p-3">Sell (+50%)</th>
                <th className="p-3">Active</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td className="p-4 text-zinc-600" colSpan={6}>
                    No products yet. Add your first one above.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const firstImg = p.images.split(",")[0]?.trim() || "";
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">
                        <div className="w-16 h-16 border rounded-xl bg-zinc-50 overflow-hidden flex items-center justify-center">
                          {firstImg ? (
                            <img
                              src={firstImg}
                              alt="preview"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-zinc-500">No image</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 min-w-[280px]">
                        <div className="font-semibold">{p.title}</div>
                        <div className="text-xs text-zinc-500 line-clamp-1">
                          {p.description}
                        </div>
                      </td>
                      <td className="p-3">${p.basePrice.toFixed(2)}</td>
                      <td className="p-3">${sellPrice(p.basePrice).toFixed(2)}</td>
                      <td className="p-3">{p.active ? "Yes" : "No"}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            className="rounded-full border px-4 py-1 font-semibold hover:border-purple-700 hover:text-purple-700"
                            onClick={() => startEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-full border px-4 py-1 font-semibold hover:border-red-600 hover:text-red-600"
                            onClick={() => onDelete(p.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
