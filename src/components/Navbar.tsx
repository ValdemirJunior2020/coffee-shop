// src/components/Navbar.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { cartCount } from "../lib/cartStore";

const CATEGORIES = [
  "Coffee Machines",
  "Grinders",
  "Kettles",
  "Mugs",
  "Beans",
  "Accessories",
];

export default function Navbar() {
  const nav = useNavigate();
  const [count, setCount] = useState(0);
  const [q, setQ] = useState("");

  useEffect(() => {
    const sync = () => setCount(cartCount());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const activeClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-[#7b189f] font-extrabold"
      : "text-zinc-700 hover:text-[#7b189f]";

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // If later you add search filtering, route with querystring:
    // nav(`/?q=${encodeURIComponent(q)}`)
    nav("/");
  };

  const badge = useMemo(() => {
    if (!count) return null;
    return (
      <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#7b189f] px-2 text-xs font-extrabold text-white">
        {count}
      </span>
    );
  }, [count]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Top utility bar */}
      <div className="bg-[#7b189f] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-sm">
          <div className="truncate">
            Free shipping* • Fast checkout • Built-in +50% margin
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <span className="opacity-90">Rewards</span>
            <span className="opacity-90">Financing</span>
            <span className="opacity-90">Support</span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b">
        <div className="mx-auto grid max-w-6xl grid-cols-12 items-center gap-3 px-4 py-3">
          {/* Logo */}
          <Link to="/" className="col-span-12 flex items-center gap-3 md:col-span-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7b189f] text-white text-lg">
              ☕
            </div>
            <div className="leading-tight">
              <div className="text-lg font-extrabold">Coffee Shop</div>
              <div className="text-xs text-zinc-500">Deals</div>
            </div>
          </Link>

          {/* Search */}
          <form
            onSubmit={onSearch}
            className="col-span-12 md:col-span-6"
          >
            <div className="flex overflow-hidden rounded-2xl border bg-white">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full px-4 py-3 outline-none"
                placeholder="Find anything coffee..."
              />
              <button
                type="submit"
                className="bg-[#7b189f] px-5 font-semibold text-white hover:opacity-90"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="col-span-12 flex items-center justify-between gap-3 md:col-span-3 md:justify-end">
            <NavLink to="/" className={activeClass}>
              Home
            </NavLink>

            <NavLink to="/admin/login" className={activeClass}>
              Admin
            </NavLink>

            <Link
              to="/cart"
              className="rounded-full border px-4 py-2 font-semibold text-zinc-800 hover:border-[#7b189f] hover:text-[#7b189f]"
            >
              Cart{badge}
            </Link>

            <Link
              to="/checkout"
              className="rounded-full bg-[#7b189f] px-5 py-2 font-semibold text-white hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-4 py-2 text-sm">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className="whitespace-nowrap text-zinc-700 hover:text-[#7b189f]"
              onClick={() => nav("/")}
              type="button"
            >
              {c}
            </button>
          ))}
          <div className="ml-auto hidden text-xs text-zinc-500 md:block">
            Verified deals • New arrivals
          </div>
        </div>
      </div>
    </header>
  );
}
