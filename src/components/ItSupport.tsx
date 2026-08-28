"use client";
import { useEffect, useState } from "react";
import { API, getToken } from "@/lib/auth";

type Ticket = { id: number; title: string; desc: string; priority: string; status: string; assigneeName?: string | null; note: string; at: string };

const PRIORITIES = ["Thấp", "Trung bình", "Cao", "Khẩn cấp"];
const ST_CLS: Record<string, string> = {
  "Mới": "bg-black border border-red-500/70 text-slate-200", "Đang xử lý": "bg-black border border-yellow-500/80 text-slate-200", "Hoàn thành": "bg-black border border-emerald-500/80 text-slate-200",
};
const PR_CLS: Record<string, string> = {
  "Khẩn cấp": "bg-black border border-red-500/70 text-slate-200", "Cao": "bg-black border border-orange-500/80 text-slate-200",
  "Trung bình": "bg-black border border-sky-500/80 text-slate-200", "Thấp": "bg-black border border-slate-600 text-slate-400",
};
const inpCls = "bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/60";

// Gửi yêu cầu hỗ trợ IT + theo dõi ticket của mình — nhúng ở trang chủ mọi phòng ban
export default function ItSupport() {
  const [mine, setMine] = useState<Ticket[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", priority: "Trung bình" });
  const [msg, setMsg] = useState("");

  const api = (path: string, opts: RequestInit = {}) =>
    fetch(`${API}${path}`, { ...opts, headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } });
  const reload = () => api("/api/it/tickets/mine").then((r) => r.json()).then((d) => Array.isArray(d) && setMine(d));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, []);

  async function submit() {
    if (!form.title.trim()) return setMsg("Nhập tiêu đề yêu cầu");
    const r = await api("/api/it/tickets", { method: "POST", body: JSON.stringify(form) });
    if (!r.ok) return setMsg((await r.json()).message || "Lỗi");
    setForm({ title: "", desc: "", priority: "Trung bình" });
    setOpen(false); setMsg(""); reload();
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold tracking-tight">Hỗ trợ IT</h2>
        <button onClick={() => { setOpen(!open); setMsg(""); }}
          className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold transition">
          {open ? "Đóng" : "Gửi yêu cầu IT"}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-5">Gửi ticket khi gặp sự cố kỹ thuật và theo dõi tiến độ xử lý</p>

      {open && (
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap gap-3">
            <input className={inpCls + " flex-1 min-w-64"} placeholder="Bạn cần hỗ trợ gì? *" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className={inpCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <textarea className={inpCls + " w-full min-h-20"} placeholder="Mô tả chi tiết (thiết bị, lỗi gặp phải, thời điểm...)"
            value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
          {msg && <p className="text-xs text-red-400">{msg}</p>}
          <button onClick={submit} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Gửi cho phòng IT</button>
        </div>
      )}

      {mine.length ? (
        <div className="space-y-1">
          {[...mine].sort((a, b) => b.at.localeCompare(a.at)).map((t) => (
            <div key={t.id} className="px-3 py-3 rounded-xl hover:bg-white/5 transition">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-sm">{t.title}</p>
                <span className="flex gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${PR_CLS[t.priority] || ""}`}>{t.priority}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ST_CLS[t.status] || ""}`}>{t.status}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t.at}{t.assigneeName ? ` · phụ trách: ${t.assigneeName}` : ""}{t.note ? ` · ${t.note}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-slate-500">Bạn chưa gửi yêu cầu nào.</p>}
    </section>
  );
}
