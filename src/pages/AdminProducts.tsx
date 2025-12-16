import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Product } from "../lib/types";

const empty: Product = {
  title: "",
  description: "",
  base_price: 0,
  margin_pct: 50,
  display_image: "",
  gallery: []
};

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sell = useMemo(() => {
    const base = Number(form.base_price || 0);
    const pct = Number(form.margin_pct || 50);
    return Math.round(base * (1 + pct / 100) * 100) / 100;
  }, [form.base_price, form.margin_pct]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to load products. Check RLS/table.");
      return;
    }

    setItems((data as any[]) as Product[]);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.title.trim()) return alert("Title required");
    if (!form.description.trim()) return alert("Description required");
    if (!form.display_image.trim()) return alert("Display image required (ex: /product-3.png)");

    const payload = {
      title: form.title,
      description: form.description,
      base_price: Number(form.base_price || 0),
      margin_pct: Number(form.margin_pct || 50),
      display_image: form.display_image,
      gallery: form.gallery || []
    };

    setLoading(true);

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      setLoading(false);
      if (error) return alert(error.message);
      setEditingId(null);
      setForm(empty);
      await load();
      return;
    }

    const { error } = await supabase.from("products").insert(payload);
    setLoading(false);
    if (error) return alert(error.message);

    setForm(empty);
    await load();
  };

  const edit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      base_price: Number(p.base_price ?? 0),
      margin_pct: Number(p.margin_pct ?? 50),
      display_image: p.display_image,
      gallery: p.gallery || []
    });
  };

  const del = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return alert(error.message);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Admin Products</h1>
          <p className="text-zinc-600 text-sm">Add / edit / delete products in Supabase</p>
        </div>
        {loading && <div className="text-sm text-zinc-500">Working…</div>}
      </div>

      <div className="border rounded-2xl bg-white p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="font-extrabold text-xl">
            {editingId ? "Edit Product" : "Add Product"}
          </div>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm(empty);
              }}
              className="rounded-full border px-4 py-2 font-semibold hover:border-wayfairPurple hover:text-wayfairPurple"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Title</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              className="mt-1 w-full border rounded-xl px-4 py-3 min-h-[90px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Base price (Temu)</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3"
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
              type="number"
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Margin %</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3"
              value={form.margin_pct}
              onChange={(e) => setForm({ ...form, margin_pct: Number(e.target.value) })}
              type="number"
            />
            <div className="text-xs text-zinc-500 mt-1">Sell: ${sell.toFixed(2)}</div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Display image path</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3"
              value={form.display_image}
              onChange={(e) => setForm({ ...form, display_image: e.target.value })}
              placeholder="/product-3.png"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Gallery (comma separated paths)</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3"
              value={(form.gallery || []).join(",")}
              onChange={(e) =>
                setForm({
                  ...form,
                  gallery: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                })
              }
              placeholder="/p3-1.png, /p3-2.png"
            />
          </div>
        </div>

        <button
          onClick={save}
          className="w-full rounded-full bg-wayfairPurple text-white px-6 py-3 font-semibold hover:opacity-90"
        >
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((p: any) => (
          <div key={p.id} className="border rounded-2xl bg-white p-4">
            <div className="flex gap-3">
              <img src={p.display_image} className="h-16 w-16 object-contain bg-zinc-50 rounded-xl" />
              <div className="flex-1">
                <div className="font-extrabold">{p.title}</div>
                <div className="text-sm text-zinc-600 line-clamp-2">{p.description}</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <div>
                <div className="text-zinc-500">Base</div>
                <div className="font-semibold">${Number(p.base_price ?? 0).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-zinc-500">Margin</div>
                <div className="font-semibold">{Number(p.margin_pct ?? 50)}%</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => edit(p)}
                className="flex-1 rounded-full border px-4 py-2 font-semibold hover:border-wayfairPurple hover:text-wayfairPurple"
              >
                Edit
              </button>
              <button
                onClick={() => del(p.id)}
                className="flex-1 rounded-full border px-4 py-2 font-semibold text-red-600 hover:border-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
