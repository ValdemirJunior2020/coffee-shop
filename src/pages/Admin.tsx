import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { LocalProduct } from "../data/products";
import {
  addProduct,
  deleteProduct,
  getProducts,
  resetProductsToDefault,
  saveProducts,
  updateProduct,
} from "../lib/productsStore";

export default function Admin() {
  const [refresh, setRefresh] = useState(0);
  const products = useMemo(() => getProducts(), [refresh]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(19.99);
  const [image, setImage] = useState("/first.png");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Coffee");

  const forceRefresh = () => setRefresh((x) => x + 1);

  const onAdd = () => {
    if (!name.trim()) return alert("Name required.");
    if (!image.trim()) return alert("Image required. Example: /first.png");
    addProduct({ name, price, image, description, category });
    setName("");
    setDescription("");
    forceRefresh();
  };

  const onEdit = (p: LocalProduct) => {
    const newName = prompt("Name", p.name) ?? p.name;
    const newPriceStr = prompt("Price", String(p.price)) ?? String(p.price);
    const newImage = prompt("Image path (/something.png)", p.image) ?? p.image;
    const newDesc = prompt("Description", p.description) ?? p.description;

    // ✅ FIXED LINE (parentheses around ?? expression)
    const newCat = (prompt("Category", p.category || "") ?? p.category) || "";

    const newPrice = Number(newPriceStr);
    if (Number.isNaN(newPrice)) return alert("Price must be a number.");

    updateProduct(p.id, {
      name: newName,
      price: newPrice,
      image: newImage,
      description: newDesc,
      category: newCat,
    });
    forceRefresh();
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this product?")) return;
    deleteProduct(id);
    forceRefresh();
  };

  const exportJson = () => {
    const data = JSON.stringify(products, null, 2);
    navigator.clipboard.writeText(data);
    alert("Copied products JSON to clipboard ✅");
  };

  const importJson = () => {
    const raw = prompt("Paste products JSON array here:");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      saveProducts(parsed);
      forceRefresh();
      alert("Imported ✅");
    } catch (e: any) {
      alert("Invalid JSON: " + (e?.message || "error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Admin Products</h1>
          <p className="text-zinc-600">
            This admin edits products stored in the browser (localStorage).
          </p>
        </div>
        <Link
          to="/"
          className="rounded-full border px-5 py-2 font-semibold hover:border-purple-700 hover:text-purple-700"
        >
          Back to Store
        </Link>
      </div>

      <div className="border rounded-2xl bg-white p-6 space-y-4">
        <div className="text-xl font-extrabold">Add product</div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New coffee"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Price</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3"
              value={price}
              type="number"
              step="0.01"
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Image path</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/first.png"
            />
            <div className="text-xs text-zinc-500 mt-1">
              Put images in /public and reference like /myimage.png
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              className="mt-1 w-full border rounded-xl px-4 py-3 min-h-[90px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Category</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Coffee"
            />
          </div>
        </div>

        <button
          onClick={onAdd}
          className="w-full rounded-full bg-purple-700 text-white px-6 py-3 font-semibold hover:bg-purple-800"
        >
          Add Product
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportJson}
            className="rounded-full border px-4 py-2 font-semibold hover:border-purple-700 hover:text-purple-700"
          >
            Copy JSON
          </button>
          <button
            onClick={importJson}
            className="rounded-full border px-4 py-2 font-semibold hover:border-purple-700 hover:text-purple-700"
          >
            Import JSON
          </button>
          <button
            onClick={() => {
              if (!confirm("Reset to default code products?")) return;
              resetProductsToDefault();
              forceRefresh();
            }}
            className="rounded-full border px-4 py-2 font-semibold hover:border-red-600 hover:text-red-600"
          >
            Reset Default
          </button>
        </div>
      </div>

      <div className="border rounded-2xl bg-white p-6">
        <div className="text-xl font-extrabold mb-4">Current products</div>

        {products.length === 0 ? (
          <div className="text-zinc-600">No products. Add one above.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((p) => (
              <div key={p.id} className="border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-extrabold">{p.name}</div>
                    <div className="text-sm text-zinc-600">
                      ${p.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">{p.image}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="rounded-full border px-4 py-2 font-semibold hover:border-purple-700 hover:text-purple-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="rounded-full border px-4 py-2 font-semibold hover:border-red-600 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="text-sm text-zinc-600 mt-2">
                  {p.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
