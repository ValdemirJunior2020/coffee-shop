import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cartCount } from "../lib/cartStore";

const CATEGORIES = [
  "Furniture",
  "Outdoor",
  "Bedding & Bath",
  "Rugs",
  "Decor & Pillows",
  "Lighting",
  "Organization",
  "Kitchen",
  "Baby & Kids",
  "Home Improvement",
  "Appliances",
  "Pet",
  "Holiday",
  "Gift Guides",
  "Verified",
  "Sale",
];

const WAYFAIR = "#7B189F";
const WAYFAIR_DARK = "#5A0F77";

export default function Navbar() {
  const [q, setQ] = useState("");
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const sync = () => setCount(cartCount());
    sync();

    window.addEventListener("cart:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="w-full border-b border-zinc-200">
      <div style={{ backgroundColor: WAYFAIR }} className="text-white">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-extrabold tracking-tight text-lg">
              coffee<span className="opacity-90">shop</span>
            </Link>
            <div className="hidden md:block text-xs opacity-90">
              Fast &amp; Free Shipping Over $35*
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button className="hidden sm:inline-flex hover:underline">Rewards</button>
            <span className="hidden sm:inline-flex opacity-70">|</span>
            <button className="hidden sm:inline-flex hover:underline">Financing</button>
            <span className="hidden sm:inline-flex opacity-70">|</span>
            <button className="hidden sm:inline-flex hover:underline">Professional</button>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 font-bold"
            style={{ color: WAYFAIR }}
          >
            <span className="text-2xl">☕</span>
            <span className="text-xl">CoffeeShop</span>
          </Link>

          <div className="flex-1">
            <div className="flex w-full overflow-hidden rounded-full border border-zinc-300">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Find anything coffee..."
                className="w-full px-5 py-3 outline-none"
              />
              <button
                className="px-6 py-3 text-white"
                aria-label="Search"
                style={{ backgroundColor: WAYFAIR }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = WAYFAIR_DARK)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = WAYFAIR)}
                onClick={() => alert(`Search later: "${q}"`)}
              >
                🔍
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link to="/admin/login" className="hover:underline">
              Admin
            </Link>

            <Link to="/cart" className="relative hover:underline font-semibold">
              Cart
              <span
                className="absolute -top-2 -right-3 h-5 min-w-5 px-1 rounded-full text-white text-xs flex items-center justify-center"
                style={{ backgroundColor: WAYFAIR }}
              >
                {count}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <nav className="bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-4 overflow-x-auto py-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className="whitespace-nowrap text-sm text-zinc-700"
                onMouseOver={(e) => (e.currentTarget.style.color = WAYFAIR)}
                onMouseOut={(e) => (e.currentTarget.style.color = "")}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ backgroundColor: WAYFAIR }} className="text-white">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-sm">
          Up to 60% OFF ends tonight | 72-Hour Clearout →
        </div>
      </div>
    </header>
  );
}
