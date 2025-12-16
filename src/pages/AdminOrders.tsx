import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Order = {
  id: string;
  created_at: string;
  status: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  cart: {
    productId: string;
    title: string;
    qty: number;
    basePrice: number;
  }[];
  totals: {
    base: number;
    sell: number;
  };
  profit_estimate: number;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load orders. Check console.");
    } else {
      setOrders(data as Order[]);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="text-lg font-semibold">Loading orders…</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Admin – Orders</h1>

      {orders.length === 0 && (
        <div className="border rounded-xl p-4 bg-white">
          No orders yet.
        </div>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded-2xl bg-white p-5 space-y-4"
        >
          <div className="flex justify-between flex-wrap gap-2">
            <div>
              <div className="font-bold">
                Order ID: <span className="text-sm">{order.id}</span>
              </div>
              <div className="text-sm text-zinc-600">
                {new Date(order.created_at).toLocaleString()}
              </div>
            </div>

            <div className="font-bold text-purple-700">
              ${order.totals.sell.toFixed(2)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-1">Customer</h3>
              <div>{order.customer.fullName}</div>
              <div className="text-sm">{order.customer.email}</div>
              <div className="text-sm">{order.customer.phone}</div>
            </div>

            <div>
              <h3 className="font-bold mb-1">Shipping</h3>
              <div>{order.shipping.address}</div>
              {order.shipping.address2 && <div>{order.shipping.address2}</div>}
              <div>
                {order.shipping.city}, {order.shipping.state}{" "}
                {order.shipping.zip}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-1">Items to Buy from Temu</h3>
            <ul className="list-disc pl-5">
              {order.cart.map((item, idx) => (
                <li key={idx}>
                  {item.qty}× {item.title} (Base ${item.basePrice})
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-zinc-600">
            Profit estimate:{" "}
            <span className="font-bold">
              ${order.profit_estimate.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
