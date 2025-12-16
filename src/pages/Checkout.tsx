import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, type CartItem } from "../lib/cartStore";
import { supabase } from "../lib/supabaseClient";

const PENDING_ORDER_KEY = "coffee_shop_pending_order_v1";
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function loadGooglePlaces(key?: string) {
  return new Promise<void>((resolve, reject) => {
    if (!key) {
      reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"));
      return;
    }
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }
    const existing = document.getElementById("google-places-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google script failed")));
      return;
    }
    const script = document.createElement("script");
    script.id = "google-places-script";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key
    )}&libraries=places`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script failed"));
    document.body.appendChild(script);
  });
}

const applyMargin = (base: number) => Math.round(base * 1.5 * 100) / 100;

export default function Checkout() {
  const nav = useNavigate();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState<string>("");

  const [saving, setSaving] = useState(false);

  // customer fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // address
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    const items = getCart();
    setCart(items);
    if (items.length === 0) nav("/cart");
  }, [nav]);

  const totals = useMemo(() => {
    const base = cart.reduce((s, i) => s + i.basePrice * i.qty, 0);
    const sell = cart.reduce((s, i) => s + applyMargin(i.basePrice) * i.qty, 0);
    return {
      base: Math.round(base * 100) / 100,
      sell: Math.round(sell * 100) / 100,
    };
  }, [cart]);

  // init Google Places Autocomplete
  useEffect(() => {
    let cancelled = false;

    loadGooglePlaces(GOOGLE_KEY)
      .then(() => {
        if (cancelled) return;
        setGoogleReady(true);

        const input = addressInputRef.current;
        if (!input) return;

        const google = (window as any).google;
        const ac = new google.maps.places.Autocomplete(input, {
          types: ["address"],
          fields: ["address_components", "formatted_address"],
        });

        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const formatted = place?.formatted_address || "";
          setAddress(formatted);

          const comps = place?.address_components || [];

          const get = (type: string) =>
            comps.find((c: any) => c.types?.includes(type))?.long_name || "";

          const getShort = (type: string) =>
            comps.find((c: any) => c.types?.includes(type))?.short_name || "";

          setCity(get("locality") || get("sublocality") || "");
          setState(getShort("administrative_area_level_1") || "");
          setZip(get("postal_code") || "");
        });
      })
      .catch((err) => {
        setGoogleError(err?.message || "Google Places not available");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveAndContinue = async () => {
    if (saving) return;

    if (!fullName.trim()) return alert("Please enter your full name.");
    if (!email.trim()) return alert("Please enter your email.");
    if (!phone.trim()) return alert("Please enter your phone number.");
    if (!address.trim()) return alert("Please enter your address.");

    const pending = {
      id: `ord_${Date.now()}`,
      createdAt: new Date().toISOString(),
      customer: { fullName, email, phone },
      shipping: { address, address2, city, state, zip },
      cart,
      totals,
      profitEstimate: Math.round((totals.sell - totals.base) * 100) / 100,
      status: "pending_payment",
    };

    // Always save locally too (backup)
    localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pending));

    try {
      setSaving(true);

      // Save to Supabase
      const { error } = await supabase.from("orders").insert({
        status: pending.status,
        customer: pending.customer,
        shipping: pending.shipping,
        cart: pending.cart,
        totals: pending.totals,
        profit_estimate: pending.profitEstimate,
        customer_email: pending.customer.email,
      });

      if (error) {
        console.error(error);
        alert("Saved locally ✅ but Supabase failed. Check console.");
        return;
      }

      alert("Saved ✅ Order stored in Supabase!");
      // Next step will be Stripe payment; for now we keep you on checkout.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* LEFT: form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold">Checkout</h1>
            <p className="text-zinc-600">
              Enter shipping info. Address autocomplete uses Google Places.
            </p>
          </div>
          <Link
            to="/cart"
            className="rounded-full border px-5 py-2 font-semibold hover:border-purple-700 hover:text-purple-700"
          >
            Back to Cart
          </Link>
        </div>

        {!googleReady && (
          <div className="border rounded-2xl p-4 bg-zinc-50 text-sm text-zinc-700">
            {googleError ? (
              <>
                <div className="font-bold text-red-600">Google Places not loaded</div>
                <div className="mt-1">{googleError}. You can still type manually.</div>
              </>
            ) : (
              <div>Loading Google address autocomplete…</div>
            )}
          </div>
        )}

        <div className="border rounded-2xl p-6 bg-white space-y-4">
          <h2 className="text-xl font-extrabold">Customer</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Full name</label>
              <input
                className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Valdemir Junior"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Email</label>
              <input
                className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                type="email"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Phone</label>
              <input
                className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(561) 555-1234"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-2xl p-6 bg-white space-y-4">
          <h2 className="text-xl font-extrabold">Shipping</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Address</label>
              <input
                ref={addressInputRef}
                className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Start typing your address…"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Apt / Unit (optional)</label>
              <input
                className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Apt 5B"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">City</label>
              <input
                className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lake Worth Beach"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">State</label>
              <input
                className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="FL"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">ZIP</label>
              <input
                className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="33460"
              />
            </div>
          </div>

          <button
            className="mt-2 w-full rounded-full bg-purple-700 text-white px-6 py-3 font-semibold hover:bg-purple-800 disabled:opacity-60"
            disabled={saving}
            onClick={saveAndContinue}
          >
            {saving ? "Saving..." : "Save Shipping Info"}
          </button>
        </div>
      </div>

      {/* RIGHT: summary */}
      <div className="border rounded-2xl bg-white p-5 h-fit">
        <div className="font-extrabold text-xl">Order Summary</div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-600">Items</span>
            <span className="font-semibold">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-600">Sell total (+50%)</span>
            <span className="font-semibold">${totals.sell.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-600">Profit estimate</span>
            <span className="font-semibold">
              ${(totals.sell - totals.base).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-5 text-xs text-zinc-500">
          Next: Stripe payment + Admin Orders page (read orders from Supabase).
        </div>
      </div>
    </div>
  );
}
