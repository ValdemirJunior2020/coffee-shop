import { useEffect, useMemo, useState } from "react";
import { addToCart } from "../lib/cartStore";

type AdminProduct = {
  id: string;
  title: string;
  basePrice: number;
  description: string;
  images: string; // comma-separated paths
  active: boolean;
  createdAt: string;
};

type StoreProduct = {
  id: string;
  title: string;
  basePrice: number;
  description: string;
  images: string[];
  active: boolean;
};

const PRODUCTS_KEY = "coffee_shop_products_v1";
const applyMargin = (base: number) => Math.round(base * 1.5 * 100) / 100;

function parseImages(images: string): string[] {
  return images
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function loadProducts(): StoreProduct[] {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as AdminProduct[];
    return data.map((p) => ({
      id: p.id,
      title: p.title,
      basePrice: Number(p.basePrice),
      description: p.description,
      images: parseImages(p.images),
      active: !!p.active,
    }));
  } catch {
    return [];
  }
}

export default function Home() {
  const [products, setProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    const load = () => setProducts(loadProducts());
    load();

    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter((p) => p.active && p.images.length > 0).slice(0, 5);
  }, [products]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    visibleProducts.find((p) => p.id === selectedId) || visibleProducts[0];

  const [activeImg, setActiveImg] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    setSelectedId(selected.id);
    setActiveImg(selected.images[0] ?? null);
  }, [selected?.id]);

  const switchProduct = (id: string) => {
    const p = visibleProducts.find((x) => x.id === id);
    if (!p) return;
    setSelectedId(id);
    setActiveImg(p.images[0] ?? null);
  };

  if (!selected) {
    return (
      <div className="border rounded-2xl p-6 bg-white">
        <h1 className="text-2xl font-extrabold">No products yet</h1>
        <p className="text-zinc-600 mt-2">
          Go to <b>/admin</b> and add products with images like{" "}
          <b>/first.png,/second.png</b>
        </p>
      </div>
    );
  }

  const sellPrice = applyMargin(selected.basePrice);

  return (
    <div className="space-y-10">
      {/* PRODUCT CARDS */}
      <section className="grid gap-4 md:grid-cols-2">
        {visibleProducts.map((p) => {
          const isActive = p.id === selected.id;
          const price = applyMargin(p.basePrice);
          const cover = p.images[0] ?? null;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => switchProduct(p.id)}
              className={[
                "text-left border rounded-2xl p-4 bg-white transition",
                isActive
                  ? "border-purple-700 ring-2 ring-purple-700/20"
                  : "border-zinc-200 hover:border-purple-700",
              ].join(" ")}
            >
              <div className="flex gap-4">
                <div className="w-28 h-28 border rounded-xl bg-zinc-50 flex items-center justify-center overflow-hidden">
                  {cover ? (
                    <img
                      src={cover}
                      alt={p.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-zinc-500">No image</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-extrabold leading-snug line-clamp-2">
                    {p.title}
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="text-xl font-extrabold text-purple-700">
                      ${price.toFixed(2)}
                    </div>
                    <div className="text-xs text-zinc-500">(+50% margin)</div>
                  </div>

                  <div className="mt-2 text-xs text-zinc-500 line-clamp-1">
                    {p.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* PRODUCT DETAIL */}
      <section className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="border rounded-2xl bg-zinc-50 p-4">
            {activeImg ? (
              <img
                src={activeImg}
                alt={selected.title}
                className="w-full h-[420px] object-contain"
              />
            ) : (
              <div className="h-[420px] flex items-center justify-center text-zinc-500">
                No image
              </div>
            )}
          </div>

          <div className="grid gap-2 mt-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
            {selected.images.map((img, idx) => {
              const isActive = img === activeImg;
              return (
                <button
                  key={`${selected.id}_${idx}_${img}`}
                  type="button"
                  onClick={() => setActiveImg(img)}
                  className={[
                    "border rounded-xl bg-white p-2 cursor-pointer hover:border-purple-600",
                    isActive
                      ? "border-purple-700 ring-2 ring-purple-700/20"
                      : "border-zinc-200",
                  ].join(" ")}
                >
                  <img
                    src={img}
                    alt="thumb"
                    className="h-16 w-full object-contain"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold leading-tight">
            {selected.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold text-purple-700">
              ${sellPrice.toFixed(2)}
            </div>
            <div className="text-sm text-zinc-500">
              Base ${selected.basePrice.toFixed(2)} • +50%
            </div>
          </div>

          <p className="text-zinc-700">{selected.description}</p>

          <div className="flex gap-3 pt-2">
            <button
              className="rounded-full bg-purple-700 text-white px-6 py-3 font-semibold hover:bg-purple-800"
              onClick={() => {
                const cover = selected.images[0];
                if (!cover) {
                  alert("This product has no image. Add images in /admin first.");
                  return;
                }

                addToCart({
                  productId: selected.id,
                  title: selected.title,
                  image: cover,
                  basePrice: selected.basePrice,
                });

                alert("Added to cart ✅");
              }}
            >
              Add to Cart
            </button>

            <button className="rounded-full border px-6 py-3 font-semibold hover:border-purple-700 hover:text-purple-700">
              Buy Now
            </button>
          </div>

          <div className="text-xs text-zinc-500 pt-2">
            Next: Checkout form + Google address autocomplete + Stripe + Supabase orders.
          </div>
        </div>
      </section>
    </div>
  );
}
