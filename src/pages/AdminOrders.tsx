import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { OrderRow } from "../lib/types";

export default function AdminOrders() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Orders fetch failed (RLS). If you kept orders SELECT private, you need admin policy.");
      return;
    }
    setRows((data as any[]) as OrderRow[]);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Admin Orders</h1>
          <p className="text-zinc-600 text-sm">Recent orders</p>
        </div>
        <button
          onClick={load}
          className="rounded-full border px-5 py-2 font-semibold hover:border-wayfairPurple hover:text-wayfairPurple"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-sm text-zinc-500">Loading…</div>}

      <div className="space-y-3">
        {rows.map((o) => (
          <div key={o.id} className="border rounded-2xl bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-extrabold">Order #{o.id}</div>
              <div className="text-sm text-zinc-600">{new Date(o.created_at).toLocaleString()}</div>
            </div>

            <div className="mt-2 text-sm">
              <div><b>Status:</b> {o.status}</div>
              <div><b>Email:</b> {o.customer_email || "—"}</div>
              <div><b>Stripe Session:</b> {o.stripe_session_id || "—"}</div>
            </div>

            <div className="mt-3 text-sm border rounded-xl p-3 bg-zinc-50">
              <div className="font-semibold mb-1">Shipping</div>
              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(o.shipping, null, 2)}</pre>
            </div>

            <div className="mt-3 text-sm border rounded-xl p-3 bg-zinc-50">
              <div className="font-semibold mb-1">Cart</div>
              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(o.cart, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
