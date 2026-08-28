"use client";
import { useState } from "react";
import { API, deptHome } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      document.cookie = `vienify_token=${data.token}; path=/; max-age=28800`;
      location.href = deptHome(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối server");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-black">
      {/* Bên trái: mascot + giới thiệu */}
      <section className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-black">
        <div className="relative z-10 flex flex-col items-center px-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Mascot-hero-section.webp" alt="Vienify Mascot"
            className="w-[46rem] max-w-full" />
          <h2 className="mt-6 text-3xl font-bold text-white tracking-tight">
            Chào mừng đến với VienifyOS
          </h2>
        </div>
      </section>

      {/* Bên phải: form đăng nhập */}
      <section className="relative flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="relative w-full max-w-sm space-y-5">
          <div className="flex flex-col items-center gap-3 mb-2">
            <span className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="VienifyOS" className="w-11 h-11" />
            </span>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">Đăng nhập VienifyOS</h1>
              <p className="text-neutral-500 text-sm mt-1">Hệ thống quản lý nội bộ Vienify</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 outline-none transition focus:border-white/60 focus:ring-2 focus:ring-white/20"
              placeholder="ban@vienify.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Mật khẩu</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 outline-none transition focus:border-white/60 focus:ring-2 focus:ring-white/20"
              placeholder="Nhập mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>

          {error && (
            <p className="text-sm text-white bg-white/10 border border-white/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button disabled={loading}
            className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold shadow-lg shadow-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="text-center text-xs text-neutral-600">
            Quên mật khẩu? Liên hệ Phòng Giám Đốc để được cấp lại.
          </p>
        </form>
      </section>
    </main>
  );
}
