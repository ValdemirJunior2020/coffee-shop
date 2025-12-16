import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

export default function App() {
  const isAdmin =
    localStorage.getItem("coffee_shop_admin_authed_v1") === "true";

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ADMIN PROTECTED */}
          <Route
            path="/admin"
            element={isAdmin ? <AdminOrders /> : <Navigate to="/admin/login" replace />}
          />

          <Route
            path="/admin/products"
            element={isAdmin ? <AdminProducts /> : <Navigate to="/admin/login" replace />}
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
