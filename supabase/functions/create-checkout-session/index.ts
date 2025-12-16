import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
    }
  });
}

function corsOk() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return corsOk();

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) return json(500, { error: "Missing STRIPE_SECRET_KEY secret" });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { orderId, successUrl, cancelUrl } = await req.json();

    if (!orderId) return json(400, { error: "Missing orderId" });
    if (!successUrl || !cancelUrl) return json(400, { error: "Missing successUrl/cancelUrl" });

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) return json(404, { error: "Order not found", details: orderErr?.message });

    const cart = Array.isArray(order.cart) ? order.cart : [];
    if (cart.length === 0) return json(400, { error: "Cart is empty" });

    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("success_url", `${successUrl}?session_id={CHECKOUT_SESSION_ID}&orderId=${encodeURIComponent(orderId)}`);
    form.set("cancel_url", `${cancelUrl}?orderId=${encodeURIComponent(orderId)}`);
    form.append("shipping_address_collection[allowed_countries][]", "US");

    // line items (use +50% margin based on basePrice)
    cart.forEach((i: any, idx: number) => {
      const name = String(i.name ?? "Coffee item");
      const qty = Number(i.qty ?? 1);
      const basePrice = Number(i.basePrice ?? 0);
      const unitAmount = Math.round(basePrice * 1.5 * 100); // cents

      form.set(`line_items[${idx}][quantity]`, String(qty));
      form.set(`line_items[${idx}][price_data][currency]`, "usd");
      form.set(`line_items[${idx}][price_data][product_data][name]`, name);
      form.set(`line_items[${idx}][price_data][unit_amount]`, String(unitAmount));
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString()
    });

    const stripeJson = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("Stripe error:", stripeJson);
      return json(500, { error: "Stripe failed", stripe: stripeJson });
    }

    await supabase
      .from("orders")
      .update({ status: "checkout_created", stripe_session_id: stripeJson.id })
      .eq("id", orderId);

    return json(200, { url: stripeJson.url, id: stripeJson.id });
  } catch (e) {
    console.error("create-checkout-session error:", e);
    return json(500, { error: String((e as any)?.message || e) });
  }
});
