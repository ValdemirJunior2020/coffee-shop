// src/App.tsx
import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminLogin from "./pages/AdminLogin";
import Success from "./pages/success.js";
import Cancel from "./pages/Cancel";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/success" element={<Success />} />
<Route path="/cancel" element={<Cancel />} />

          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* ✅ FIX: /admin redirect */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* optional: catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
