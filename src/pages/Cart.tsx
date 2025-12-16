import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  clearCart,
  getCart,
  removeFromCart,
  setQty,
  type CartItem,
} from "../lib/cartStore";

const applyMargin = (base: number) => Math.round(base * 1.5 * 100) / 100;

export default function Cart() {
  const nav = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);

  const reload = () => setItems(getCart());

  useEffect(() => {
    reload();

    const onCart = () => reload();
    const onStorage = () => reload();

    window.addEventListener("cart:changed", onCart);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("cart:changed", onCart);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const totals = useMemo(() => {
    const baseTotal = items.reduce((sum, i) => sum + i.basePrice * i.qty, 0);
    const sellTotal = items.reduce(
      (sum, i) => sum + applyMargin(i.basePrice) * i.qty,
      0
    );
    return {
      baseTotal: Math.round(baseTotal * 100) / 100,
      sellTotal: Math.round(sellTotal * 100) / 100,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Cart</h1>
          <p className="text-zinc-600">Review items before checkout.</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/"
            className="rounded-full border px-5 py-2 font-semibold hover:border-purple-700 hover:text-purple-700"
          >
            Continue Shopping
          </Link>
          <button
            className="rounded-full border px-5 py-2 font-semibold hover:border-red-600 hover:text-red-600"
            onClick={() => {
              if (confirm("Clear cart?")) clearCart();
              reload();
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border rounded-2xl p-6 bg-white">
          <p className="text-zinc-700">Your cart is empty.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 border rounded-2xl bg-white overflow-hidden">
            <div className="border-b px-5 py-4 font-bold">Items</div>

            <div className="divide-y">
              {items.map((i) => (
                <div key={i.productId} className="p-5 flex gap-4">
                  <div className="w-24 h-24 border rounded-xl bg-zinc-50 overflow-hidden flex items-center justify-center">
                    <img
                      src={i.image}
                      alt={i.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="font-extrabold leading-snug">{i.title}</div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                      <div>
                        Price:{" "}
                        <span className="font-bold text-purple-700">
                          ${applyMargin(i.basePrice).toFixed(2)}
                        </span>{" "}
                        <span className="text-zinc-500">
                          (base ${i.basePrice.toFixed(2)})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-zinc-600">Qty</span>
                        <input
                          className="w-20 border rounded-lg px-2 py-1"
                          type="number"
                          min={1}
                          value={i.qty}
                          onChange={(e) => {
                            setQty(i.productId, Number(e.target.value));
                            reload();
                          }}
                        />
                      </div>

                      <button
                        className="text-red-600 font-semibold hover:underline"
                        onClick={() => {
                          removeFromCart(i.productId);
                          reload();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="font-extrabold text-right min-w-[110px]">
                    ${(applyMargin(i.basePrice) * i.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border rounded-2xl bg-white p-5 h-fit">
            <div className="font-extrabold text-xl">Order Summary</div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Base total (your cost)</span>
                <span className="font-semibold">
                  ${totals.baseTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Sell total (+50%)</span>
                <span className="font-semibold">
                  ${totals.sellTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Your profit (est.)</span>
                <span className="font-semibold">
                  ${(totals.sellTotal - totals.baseTotal).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              className="mt-5 w-full rounded-full bg-purple-700 text-white px-6 py-3 font-semibold hover:bg-purple-800"
              onClick={() => nav("/checkout")}
            >
              Proceed to Checkout
            </button>

            <div className="text-xs text-zinc-500 mt-3">
              Next we’ll collect shipping info (Google address autocomplete) and charge via Stripe.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
