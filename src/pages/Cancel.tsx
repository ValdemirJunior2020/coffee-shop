import { Link, useSearchParams } from "react-router-dom";

export default function Cancel() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold">Payment Canceled</h1>

      <div className="mt-4 border rounded-2xl p-4 bg-white">
        <p className="text-zinc-700">No charge was completed.</p>
        {orderId && <p className="text-zinc-500 mt-2">Order: {orderId}</p>}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to="/cart"
          className="rounded-full bg-purple-700 text-white px-6 py-3 font-semibold hover:bg-purple-800"
        >
          Back to Cart
        </Link>
        <Link
          to="/checkout"
          className="rounded-full border px-6 py-3 font-semibold hover:border-purple-700 hover:text-purple-700"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
