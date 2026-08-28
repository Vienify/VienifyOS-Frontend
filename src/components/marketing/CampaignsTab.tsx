// Tab Chiến dịch — kanban / danh sách (giống tab Khách hàng phòng Business) + modal tạo/sửa + modal cập nhật số liệu
import { useState } from "react";
import { X, Megaphone, Target, Wallet, CalendarDays, StickyNote, BarChart3 } from "lucide-react";
import { Api, Badge, CAMP_COLS, Card, Me, Mkt, Notify, Put, Table, dmy, inpCls, money, num } from "./shared";

const emptyCamp = { name: "", goal: "", channels: [] as string[], budget: "", start: "", end: "", note: "" };

export default function CampaignsTab({ mk, me, isLeader, api, notify, reload, put, askConfirm }: {
  mk: Mkt; me: Me; isLeader: boolean; api: Api; notify: Notify; reload: () => void; put: Put;
  askConfirm: (msg: string, onOk: () => void) => void;
}) {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"kanban" | "list">("kanban");
  const [campForm, setCampForm] = useState<(typeof emptyCamp & { id?: number }) | null>(null);
  const [metricFor, setMetricFor] = useState<{ id: number; spent: string; leads: string; reach: string } | null>(null);

  const filtered = mk.campaigns.filter((c) =>
    (c.name + c.goal + (c.ownerName || "") + c.channels.join(" ")).toLowerCase().includes(search.toLowerCase()));

  async function submitCamp() {
    if (!campForm?.name) return notify("Nhập tên chiến dịch");
    const body = { ...campForm, budget: Number(campForm.budget) || 0 };
    if (campForm.id) return put(`/api/marketing/campaigns/${campForm.id}`, body, "Đã lưu chiến dịch").then(() => setCampForm(null));
    const r = await api("/api/marketing/campaigns", { method: "POST", body: JSON.stringify(body) });
    if (!r.ok) return notify((await r.json()).message || "Lỗi");
    notify("Đã tạo chiến dịch (cột Ý tưởng)", "success"); setCampForm(null); reload();
  }

  // Các nút thao tác theo trạng thái — dùng chung cho kanban và danh sách
  const actions = (c: Mkt["campaigns"][number]) => {
    const own = c.ownerId === me?.id;
    return (
      <div className="flex flex-wrap gap-1.5">
        {c.status === "Ý tưởng" && (own || isLeader) && (
          <button onClick={() => put(`/api/marketing/campaigns/${c.id}`, { status: "Chờ duyệt" }, "Đã gửi leader duyệt")}
            className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">Gửi duyệt</button>
        )}
        {c.status === "Chờ duyệt" && isLeader && (
          <>
            <button onClick={() => put(`/api/marketing/campaigns/${c.id}`, { status: "Đang chạy" }, "Chiến dịch bắt đầu chạy")}
              className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">Duyệt & chạy</button>
            <button onClick={() => put(`/api/marketing/campaigns/${c.id}`, { status: "Từ chối" }, "Đã từ chối chiến dịch")}
              className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-xs font-semibold">Từ chối</button>
          </>
        )}
        {c.status === "Đang chạy" && (own || isLeader) && (
          <button onClick={() => setMetricFor({ id: c.id, spent: String(c.spent), leads: String(c.leads), reach: String(c.reach) })}
            className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">Cập nhật số liệu</button>
        )}
        {c.status === "Đang chạy" && isLeader && (
          <button onClick={() => askConfirm(`Kết thúc chiến dịch "${c.name}"?`, () => put(`/api/marketing/campaigns/${c.id}`, { status: "Kết thúc" }, "Đã kết thúc chiến dịch"))}
            className="px-2.5 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs font-semibold">Kết thúc</button>
        )}
        {c.status === "Từ chối" && (own || isLeader) && (
          <button onClick={() => put(`/api/marketing/campaigns/${c.id}`, { status: "Ý tưởng" }, "Đã đưa về Ý tưởng để sửa")}
            className="px-2.5 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs">Về Ý tưởng</button>
        )}
        {(own || isLeader) && c.status !== "Kết thúc" && (
          <button onClick={() => setCampForm({ id: c.id, name: c.name, goal: c.goal, channels: c.channels, budget: String(c.budget), start: c.start, end: c.end, note: c.note })}
            className="px-2.5 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs">Sửa</button>
        )}
      </div>
    );
  };

  return (
    <Card title={`Chiến dịch quảng cáo (${filtered.length})`}>
      <div className="flex flex-wrap gap-3 justify-between mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-neutral-800 p-0.5">
            <button onClick={() => setMode("kanban")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${mode === "kanban" ? "bg-white text-black" : "text-slate-400 hover:text-white"}`}>Kanban</button>
            <button onClick={() => setMode("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${mode === "list" ? "bg-white text-black" : "text-slate-400 hover:text-white"}`}>Danh sách</button>
          </div>
          <input className={inpCls + " w-72"} placeholder="Tìm theo tên, mục tiêu, kênh, phụ trách..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setCampForm({ ...emptyCamp })}
          className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
          Tạo chiến dịch
        </button>
      </div>
      {!isLeader && <p className="text-xs text-slate-500 mb-4">Tạo ở cột Ý tưởng → gửi leader duyệt → leader cho chạy</p>}

      {/* Modal tạo / sửa chiến dịch */}
      {campForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-6" onClick={() => setCampForm(null)}>
          <div className="bg-black border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 pb-5 border-b border-neutral-800/80">
              <div className="flex items-center gap-4 min-w-0">
                <span className="grid place-items-center w-12 h-12 rounded-full bg-white text-black shrink-0">
                  <Megaphone size={22} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-tight">{campForm.id ? "Sửa chiến dịch" : "Tạo chiến dịch"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {campForm.id ? "Cập nhật thông tin chiến dịch." : "Chiến dịch mới sẽ vào cột Ý tưởng, gửi leader duyệt để chạy."}
                  </p>
                </div>
              </div>
              <button onClick={() => setCampForm(null)}
                className="grid place-items-center w-8 h-8 rounded-full border border-neutral-700 text-slate-400 hover:bg-white/10 hover:text-white shrink-0"
                aria-label="Đóng">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Tên chiến dịch *</label>
                <div className="relative">
                  <Megaphone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="VD: Back to School 2026"
                    value={campForm.name} onChange={(e) => setCampForm({ ...campForm, name: e.target.value })} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Mục tiêu chiến dịch</label>
                <div className="relative">
                  <Target size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="VD: Tăng nhận diện + leads dịch vụ"
                    value={campForm.goal} onChange={(e) => setCampForm({ ...campForm, goal: e.target.value })} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Ngân sách (triệu VND)</label>
                <div className="relative">
                  <Wallet size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} type="number" min={0} placeholder="VD: 50"
                    value={campForm.budget} onChange={(e) => setCampForm({ ...campForm, budget: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Bắt đầu</label>
                <div className="relative">
                  <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} type="date" value={campForm.start}
                    onChange={(e) => setCampForm({ ...campForm, start: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Kết thúc</label>
                <div className="relative">
                  <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} type="date" value={campForm.end}
                    onChange={(e) => setCampForm({ ...campForm, end: e.target.value })} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Kênh triển khai</label>
                <div className="flex flex-wrap gap-2">
                  {mk.channels.map((ch) => (
                    <label key={ch} className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer ${campForm.channels.includes(ch) ? "border-white bg-white text-black font-semibold" : "border-neutral-700 text-slate-400 hover:bg-white/10"}`}>
                      <input type="checkbox" className="hidden" checked={campForm.channels.includes(ch)}
                        onChange={(e) => setCampForm({ ...campForm, channels: e.target.checked ? [...campForm.channels, ch] : campForm.channels.filter((x) => x !== ch) })} />
                      {ch}
                    </label>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Ghi chú</label>
                <div className="relative">
                  <StickyNote size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="Định hướng nội dung, lưu ý..."
                    value={campForm.note} onChange={(e) => setCampForm({ ...campForm, note: e.target.value })} />
                </div>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-neutral-800/80">
                <button onClick={() => setCampForm(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-sm">Huỷ</button>
                <button onClick={submitCamp}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
                  {campForm.id ? "Lưu thay đổi" : "Tạo chiến dịch"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Kanban ===== */}
      {mode === "kanban" && (
        <div className="flex gap-3 overflow-x-auto pb-2 items-start">
          {CAMP_COLS.map((col) => {
            const cards = filtered.filter((c) => c.status === col.st || col.extra.includes(c.status));
            return (
              <div key={col.st} className="w-72 shrink-0">
                <p className="flex items-center gap-2 px-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-200">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  {col.label} <span className={col.cnt}>({cards.length})</span>
                </p>
                <div className={`h-0.5 rounded-full mb-3 ${col.line}`} />
                <div className="space-y-2 min-h-20">
                  {cards.map((c) => (
                    <div key={c.id} className="rounded-xl bg-white/5 hover:bg-white/10 transition p-3 space-y-1.5">
                      <p className="font-medium text-sm">{c.name} {c.status === "Từ chối" && <Badge s="Từ chối" />}</p>
                      {c.goal && <p className="text-xs text-slate-500">{c.goal}</p>}
                      <p className="text-xs text-slate-400">{c.channels.join(", ") || "—"}</p>
                      <p className="text-xs text-slate-400">{money(c.spent)} / {money(c.budget)}</p>
                      {(c.leads > 0 || c.reach > 0) && <p className="text-xs text-slate-300">{num(c.leads)} leads · {num(c.reach)} tiếp cận</p>}
                      <p className="text-xs text-slate-500">{dmy(c.start)} - {dmy(c.end)} · {c.ownerName}{c.ownerId === me?.id ? " (bạn)" : ""}</p>
                      <div className="pt-1">{actions(c)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Danh sách dạng bảng ===== */}
      {mode === "list" && (
        <Table head={["Chiến dịch", "Kênh", "Ngân sách", "Đã chi", "Leads", "Thời gian", "Phụ trách", "Trạng thái", ""]}
          rows={filtered.map((c) => [
            <div key="n">
              <p className="font-medium text-white">{c.name}</p>
              {c.goal && <p className="text-xs text-slate-500 max-w-52 truncate" title={c.goal}>{c.goal}</p>}
            </div>,
            <span key="ch" className="text-xs text-slate-400">{c.channels.join(", ") || "—"}</span>,
            money(c.budget), money(c.spent),
            <span key="l" className="whitespace-nowrap">{num(c.leads)}</span>,
            <span key="t" className="text-xs text-slate-500 whitespace-nowrap">{dmy(c.start)} - {dmy(c.end)}</span>,
            c.ownerName || "—",
            <Badge key="s" s={c.status} />,
            <div key="a">{actions(c)}</div>,
          ])} />
      )}

      {/* Modal cập nhật số liệu chiến dịch */}
      {metricFor && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm grid place-items-center p-6" onClick={() => setMetricFor(null)}>
          <div className="bg-black border border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 p-6 pb-5 border-b border-neutral-800/80">
              <div className="flex items-center gap-4 min-w-0">
                <span className="grid place-items-center w-12 h-12 rounded-full bg-white text-black shrink-0">
                  <BarChart3 size={22} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-tight">Cập nhật số liệu</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Số liệu mới nhất của chiến dịch đang chạy.</p>
                </div>
              </div>
              <button onClick={() => setMetricFor(null)}
                className="grid place-items-center w-8 h-8 rounded-full border border-neutral-700 text-slate-400 hover:bg-white/10 hover:text-white shrink-0"
                aria-label="Đóng">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {([["spent", "Đã chi (triệu VND)"], ["leads", "Leads"], ["reach", "Lượt tiếp cận"]] as const).map(([k, l]) => (
                <div key={k}>
                  <label className="block text-xs text-slate-500 mb-1.5">{l}</label>
                  <input type="number" className={inpCls + " w-full"} value={metricFor[k]}
                    onChange={(e) => setMetricFor({ ...metricFor, [k]: e.target.value })} />
                </div>
              ))}
              <div className="flex gap-2 justify-end pt-2 border-t border-neutral-800/80">
                <button onClick={() => setMetricFor(null)} className="px-4 py-2 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">Huỷ</button>
                <button onClick={async () => {
                  await put(`/api/marketing/campaigns/${metricFor.id}`, { spent: Number(metricFor.spent) || 0, leads: Number(metricFor.leads) || 0, reach: Number(metricFor.reach) || 0 }, "Đã cập nhật số liệu");
                  setMetricFor(null);
                }} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
