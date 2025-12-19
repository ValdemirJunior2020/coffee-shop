// src/pages/Cart.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, removeFromCart, setQty } from "../lib/cartStore";
import type { CartItem } from "../lib/types";

const applyMargin = (base: number) => Math.round(base * 1.5 * 100) / 100;

export default function Cart() {
  const nav = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);

  const refresh = () => setItems(getCart());

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const totals = useMemo(() => {
    const base = items.reduce((s, i) => s + (Number(i.basePrice) || 0) * (Number(i.qty) || 0), 0);
    const sell = items.reduce(
      (s, i) => s + applyMargin(Number(i.basePrice) || 0) * (Number(i.qty) || 0),
      0
    );
    return {
      base: Math.round(base * 100) / 100,
      sell: Math.round(sell * 100) / 100,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-white p-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Cart</h1>
          <p className="text-zinc-600">Adjust quantities then checkout.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/"
            className="rounded-full border px-5 py-2 font-semibold hover:border-[#7b189f] hover:text-[#7b189f]"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => nav("/checkout")}
            disabled={items.length === 0}
            className="rounded-full bg-[#7b189f] px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            Checkout
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border bg-white p-10 text-center">
          <div className="text-xl font-extrabold">Your cart is empty</div>
          <div className="mt-2 text-zinc-600">Add something from Home.</div>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-[#7b189f] px-6 py-3 font-semibold text-white hover:opacity-90"
          >
            Go to Home
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((i) => (
              // ✅ FIX: key MUST be stable + unique
              <div key={i.id} className="rounded-3xl border bg-white p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 rounded-2xl bg-zinc-50 overflow-hidden flex items-center justify-center">
                    {i.image ? (
                      <img src={i.image} alt={i.name} className="h-full w-full object-contain p-2" />
                    ) : (
                      <span className="text-2xl">☕</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#7b189f]">{i.category}</div>
                    <div className="text-lg font-extrabold">{i.name}</div>
                    <div className="text-sm text-zinc-600 line-clamp-2">{i.description}</div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm">
                        <div className="text-zinc-500 text-xs">Sell price</div>
                        <div className="text-xl font-extrabold">
                          ${applyMargin(Number(i.basePrice) || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-zinc-700">Qty</label>
                        <input
                          type="number"
                          min={1}
                          value={i.qty}
                          onChange={(e) => {
                            const q = Number(e.target.value);
                            setQty(i.id, q);
                            refresh();
                          }}
                          className="w-20 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#7b189f]/20 focus:border-[#7b189f]"
                        />

                        <button
                          className="rounded-full border px-4 py-2 font-semibold hover:border-red-500 hover:text-red-600"
                          onClick={() => {
                            removeFromCart(i.id);
                            refresh();
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border bg-white p-5 h-fit">
            <div className="text-xl font-extrabold">Summary</div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Items</span>
                <span className="font-semibold">{items.reduce((s, x) => s + x.qty, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Sell Total</span>
                <span className="font-semibold">${totals.sell.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Cost Total</span>
                <span className="font-semibold">${totals.base.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Profit Estimate</span>
                <span className="font-semibold">${(totals.sell - totals.base).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => nav("/checkout")}
              className="mt-5 w-full rounded-full bg-[#7b189f] px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Go to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
