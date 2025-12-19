import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { clearCart } from "../lib/cartStore";

export default function Success() {
  const [params] = useSearchParams();
  const session_id = params.get("session_id");
  const orderId = params.get("orderId");

  const [status, setStatus] = useState<"checking" | "paid" | "unpaid" | "error">("checking");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        if (!session_id) {
          setStatus("error");
          setMsg("Missing session_id in URL. Check your STRIPE_SUCCESS_URL configuration.");
          return;
        }

        // Ask backend to verify with Stripe
        const { data, error } = await supabase.functions.invoke("verify-checkout-session", {
          body: { sessionId: session_id, orderId },
        });

        if (error) {
          setStatus("error");
          setMsg(error.message || "Verification failed.");
          return;
        }

        const paid = (data as any)?.paid === true;

        if (paid) {
          setStatus("paid");
          clearCart();
          return;
        }

        setStatus("unpaid");
      } catch (e: any) {
        setStatus("error");
        setMsg(e?.message || "Unknown error");
      }
    };

    run();
  }, [session_id, orderId]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold">Payment Status</h1>

      <div className="mt-4 border rounded-2xl p-4 bg-white">
        {status === "checking" && <p>Checking payment with Stripe…</p>}
        {status === "paid" && (
          <>
            <p className="font-bold text-green-700">✅ Payment confirmed!</p>
            <p className="text-zinc-600 mt-1">Your order is now marked as paid.</p>
          </>
        )}
        {status === "unpaid" && (
          <>
            <p className="font-bold text-amber-700">⚠️ Payment not completed.</p>
            <p className="text-zinc-600 mt-1">If you think you paid, contact support.</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="font-bold text-red-700">❌ Verification error</p>
            <p className="text-zinc-600 mt-1">{msg}</p>
          </>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="rounded-full bg-purple-700 text-white px-6 py-3 font-semibold hover:bg-purple-800"
        >
          Back Home
        </Link>
        <Link
          to="/admin"
          className="rounded-full border px-6 py-3 font-semibold hover:border-purple-700 hover:text-purple-700"
        >
          View Orders (Admin)
        </Link>
      </div>
    </div>
  );
}
