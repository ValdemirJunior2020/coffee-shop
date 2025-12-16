// src/pages/Home.tsx
import { useMemo } from "react";
import { addToCart } from "../lib/cartStore";
import type { Product } from "../lib/types";

const applyMargin = (base: number) => Math.round(base * 1.5 * 100) / 100;

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name:
      "20Bar Espresso Machine with Conical Burr Grinder, Milk Frother Steam Wand, 1.8L Water Tank",
    description:
      "Makes Cappuccino, Latte, Iced Coffee And Americano. Home Barista, Professional Design.",
    image: "/first.png",
    category: "Coffee Machines",
    basePrice: 245.8,
  },
  {
    id: "p2",
    name:
      "Hot & Iced Coffee Machine (20Bar) With Rapid Cold Brew | Espresso Maker Featuring Steam Wand, 37oz Tank & Touch Screen",
    description:
      "Great For Latte/ Cappuccino, Gift For Coffee Enthusiasts. Brand: YABANO",
    image: "/product-2.png",
    category: "Coffee Machines",
    basePrice: 76.49,
  },
];

export default function Home() {
  const productsWithSell = useMemo(() => {
    return PRODUCTS.map((p) => {
      const base = Number(p.basePrice);
      const safeBase = Number.isFinite(base) ? base : 0;
      const sell = applyMargin(safeBase);
      return { ...p, basePrice: safeBase, sellPrice: sell };
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero (Wayfair-ish) */}
      <div className="rounded-3xl border bg-white p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold">
              Coffee Shop <span className="text-[#7b189f]">Deals</span>
            </h1>
            <p className="mt-2 text-zinc-600">
              Wayfair-inspired style • +50% margin built in • Add to cart and checkout.
            </p>
          </div>

          <div className="mt-3 rounded-2xl bg-[#7b189f]/10 px-4 py-3 text-sm text-zinc-700 md:mt-0">
            <span className="font-bold text-[#7b189f]">Today:</span> Extra deals on espresso
            machines
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {productsWithSell.map((p) => (
          <div key={p.id} className="rounded-3xl border bg-white p-4">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-50">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-contain p-4"
                />
              ) : null}
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs font-bold text-[#7b189f]">{p.category}</div>
              <div className="text-lg font-extrabold leading-tight">{p.name}</div>
              <div className="text-sm text-zinc-600 line-clamp-3">{p.description}</div>

              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs text-zinc-500">Your price</div>
                  <div className="text-2xl font-extrabold">
                    ${p.sellPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Cost: ${p.basePrice.toFixed(2)} • +50%
                  </div>
                </div>

                <button
                  className="rounded-full bg-[#7b189f] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                  onClick={() => {
                    addToCart(
                      {
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        image: p.image,
                        category: p.category,
                        basePrice: p.basePrice,
                      },
                      1
                    );
                    alert("Added to cart ✅");
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
