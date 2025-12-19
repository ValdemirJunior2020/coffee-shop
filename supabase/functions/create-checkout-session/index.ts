import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function isHttpUrl(v: string) {
  return /^https?:\/\/.+/i.test(v);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const SUCCESS_URL = Deno.env.get("STRIPE_SUCCESS_URL") || "http://localhost:5173/success";
    const CANCEL_URL = Deno.env.get("STRIPE_CANCEL_URL") || "http://localhost:5173/cancel";

    if (!STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY secret" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!STRIPE_SECRET_KEY.startsWith("sk_")) {
      return new Response(
        JSON.stringify({
          error:
            "STRIPE_SECRET_KEY looks wrong. Use the Stripe secret TOKEN that starts with sk_...",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isHttpUrl(SUCCESS_URL)) {
      return new Response(
        JSON.stringify({
          error: `Invalid STRIPE_SUCCESS_URL. Must start with http:// or https://. Got: ${SUCCESS_URL}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isHttpUrl(CANCEL_URL)) {
      return new Response(
        JSON.stringify({
          error: `Invalid STRIPE_CANCEL_URL. Must start with http:// or https://. Got: ${CANCEL_URL}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId || "");
    const amount = Number(body?.amount);

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing orderId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "Missing/invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${SUCCESS_URL}?orderId=${encodeURIComponent(orderId)}`,
      cancel_url: `${CANCEL_URL}?orderId=${encodeURIComponent(orderId)}`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Coffee Shop Order" },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { orderId },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
