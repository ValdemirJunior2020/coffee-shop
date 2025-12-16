import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_KEY = "coffee_shop_admin_authed_v1";

// simple for now (we’ll move to Supabase Auth later)
const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASS = "admin123";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [pass, setPass] = useState(ADMIN_PASS);
  const [err, setErr] = useState("");

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (email.trim().toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASS) {
      localStorage.setItem(ADMIN_KEY, "true");
      nav("/admin");
      return;
    }

    setErr("Invalid admin email or password.");
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="border rounded-2xl p-6 bg-white">
        <h1 className="text-2xl font-extrabold">Admin Login</h1>
        <p className="text-zinc-600 mt-1">
          Temporary login (we’ll replace with Supabase auth).
        </p>

        <form onSubmit={onLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Password</label>
            <input
              className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="admin123"
              type="password"
              autoComplete="current-password"
            />
          </div>

          {err && (
            <div className="text-sm text-red-600 font-semibold">{err}</div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-purple-700 text-white px-6 py-3 font-semibold hover:bg-purple-800"
          >
            Sign in
          </button>

          <div className="text-xs text-zinc-500">
            Default: <b>admin@admin.com</b> / <b>admin123</b>
          </div>
        </form>
      </div>
    </div>
  );
}
