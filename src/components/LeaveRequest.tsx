"use client";
import { useEffect, useState } from "react";
import { API, getToken } from "@/lib/auth";

type Leave = { id: number; type: string; from: string; to: string; reason: string; status: string; note: string; decidedByName?: string | null; at: string };

const LEAVE_TYPES = ["Nghỉ phép", "Nghỉ ốm", "Việc riêng", "Remote"];
const ST_CLS: Record<string, string> = {
  "Chờ duyệt": "bg-black border border-yellow-500/80 text-slate-200", "Đã duyệt": "bg-black border border-emerald-500/80 text-slate-200", "Từ chối": "bg-black border border-red-500/70 text-slate-400",
};
const inpCls = "bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/60";
const dmy = (s: string) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}` : "—");

// Gửi đơn nghỉ phép cho phòng HR + theo dõi đơn của mình — nhúng ở trang chủ mọi phòng ban
export default function LeaveRequest() {
  const [mine, setMine] = useState<Leave[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "Nghỉ phép", from: "", to: "", reason: "" });
  const [msg, setMsg] = useState("");

  const api = (path: string, opts: RequestInit = {}) =>
    fetch(`${API}${path}`, { ...opts, headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } });
  const reload = () => api("/api/hr/leaves/mine").then((r) => r.json()).then((d) => Array.isArray(d) && setMine(d));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, []);

  async function submit() {
    if (!form.from || !form.to) return setMsg("Chọn ngày bắt đầu và kết thúc");
    if (!form.reason.trim()) return setMsg("Ghi lý do nghỉ");
    const r = await api("/api/hr/leaves", { method: "POST", body: JSON.stringify(form) });
    if (!r.ok) return setMsg((await r.json()).message || "Lỗi");
    setForm({ type: "Nghỉ phép", from: "", to: "", reason: "" });
    setOpen(false); setMsg(""); reload();
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold tracking-tight">Nghỉ phép</h2>
        <button onClick={() => { setOpen(!open); setMsg(""); }}
          className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold transition">
          {open ? "Đóng" : "Gửi đơn nghỉ phép"}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-5">Gửi đơn cho phòng HR và theo dõi trạng thái duyệt</p>

      {open && (
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <select className={inpCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <label className="text-xs text-slate-400">Từ
              <input type="date" className={inpCls + " ml-2"} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
            </label>
            <label className="text-xs text-slate-400">Đến
              <input type="date" className={inpCls + " ml-2"} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
            </label>
          </div>
          <textarea className={inpCls + " w-full min-h-16"} placeholder="Lý do nghỉ *"
            value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          {msg && <p className="text-xs text-red-400">{msg}</p>}
          <button onClick={submit} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Gửi cho phòng HR</button>
        </div>
      )}

      {mine.length ? (
        <div className="space-y-1">
          {[...mine].sort((a, b) => b.at.localeCompare(a.at)).map((l) => (
            <div key={l.id} className="px-3 py-3 rounded-xl hover:bg-white/5 transition">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-sm">{l.type} · {dmy(l.from)}{l.to !== l.from ? ` - ${dmy(l.to)}` : ""} — {l.reason}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ST_CLS[l.status] || ""}`}>{l.status}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                gửi {l.at}{l.decidedByName ? ` · duyệt bởi: ${l.decidedByName}` : ""}{l.note ? ` · ${l.note}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-slate-500">Bạn chưa có đơn nào.</p>}
    </section>
  );
}
