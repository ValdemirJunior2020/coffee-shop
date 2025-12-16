import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return json(200, { ok: true });

  try {
    const { orderId } = await req.json();
    if (!orderId) return json(400, { error: "Missing orderId" });

    // Load the order from Supabase so the client can't change prices
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id,status,customer_email,totals")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) return json(404, { error: "Order not found" });

    // allow pending_payment OR checkout_created (in case they retry)
    if (order.status !== "pending_payment" && order.status !== "checkout_created") {
      return json(400, { error: `Order status is ${order.status}` });
    }

    const sellTotal = Number(order.totals?.sell ?? 0);
    if (!sellTotal || sellTotal <= 0) return json(400, { error: "Invalid total" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customer_email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "CoffeeShop Order", description: `Order ${order.id}` },
            unit_amount: Math.round(sellTotal * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: order.id },
      success_url: `${APP_URL}/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/checkout?canceled=1`,
    });

    // Store session id + mark created
    await supabase
      .from("orders")
      .update({
        status: "checkout_created",
        totals: { ...(order.totals || {}), stripe_session_id: session.id },
      })
      .eq("id", order.id);

    return json(200, { url: session.url });
  } catch (e) {
    return json(500, { error: String((e as any)?.message || e) });
  }
});
