// Tab Khách hàng — Kanban / danh sách + form thêm khách hàng + gửi đơn duyệt
import { useState } from "react";
import { X, Building2, UserRound, UserRoundPlus, Phone, Mail, MessageCircle, StickyNote } from "lucide-react";
import { Profile } from "@/lib/auth";
import { Api, Badge, Biz, COLS, Card, Customer, DRAGGABLE, Deal, Invoice, Me, Notify, Table, inpCls, money, selCls } from "./shared";

const emptyCf = { name: "", company: "", phone: "", zalo: "", email: "", note: "", ownerId: "" };

export default function CustomersTab({ biz, members, me, isLeader, api, reload, notify, createInvoice, moveCard, printInvoice, onViewCustomer, askConfirm }: {
  biz: Biz; members: Profile[]; me: Me; isLeader: boolean; api: Api; reload: () => void; notify: Notify;
  createInvoice: (d: Deal) => void; moveCard: (id: number, status: string) => void; printInvoice: (inv: Invoice) => void;
  onViewCustomer: (c: Customer) => void; askConfirm: (msg: string, onOk: () => void) => void;
}) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [custMode, setCustMode] = useState<"kanban" | "list">("kanban"); // chế độ xem khách hàng
  const [cf, setCf] = useState(emptyCf);
  const [dealFor, setDealFor] = useState<Customer | null>(null);
  const [dealNote, setDealNote] = useState("");
  const [items, setItems] = useState<{ code: string; price: string }[]>([]);

  const filteredCustomers = biz.customers.filter((c) =>
    (c.name + c.company + (c.ownerName || "")).toLowerCase().includes(search.toLowerCase()));

  const canDrag = (c: Customer) => (isLeader || c.ownerId === me?.id) && DRAGGABLE.includes(c.status);

  async function addCustomer(e: React.FormEvent) {
    e.preventDefault();
    const contacts: Record<string, string> = {};
    if (cf.phone) contacts.phone = cf.phone;
    if (cf.zalo) contacts.zalo = cf.zalo;
    if (cf.email) contacts.email = cf.email;
    const res = await api("/api/business/customers", {
      method: "POST",
      body: JSON.stringify({ name: cf.name, company: cf.company, note: cf.note, contacts, ownerId: cf.ownerId ? Number(cf.ownerId) : null }),
    });
    if (res.ok) { setCf(emptyCf); setShowAdd(false); reload(); }
  }

  async function submitDeal() {
    const res = await api("/api/business/deals", {
      method: "POST",
      body: JSON.stringify({ customerId: dealFor!.id, note: dealNote, items }),
    });
    if (res.ok) { setDealFor(null); setDealNote(""); setItems([]); reload(); notify("Đã gửi đơn cho leader duyệt", "success"); } else notify((await res.json()).message);
  }

  return (
    <Card title={`Khách hàng (${filteredCustomers.length})`}>
      <div className="flex flex-wrap gap-3 justify-between mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-neutral-800 p-0.5">
            <button onClick={() => setCustMode("kanban")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${custMode === "kanban" ? "bg-white text-black" : "text-slate-400 hover:text-white"}`}>Kanban</button>
            <button onClick={() => setCustMode("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${custMode === "list" ? "bg-white text-black" : "text-slate-400 hover:text-white"}`}>Danh sách</button>
          </div>
          <input className={inpCls + " w-72"} placeholder="Tìm theo tên, công ty, người phụ trách..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
          Thêm khách hàng
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-6" onClick={() => setShowAdd(false)}>
          <div className="bg-black border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 pb-5 border-b border-neutral-800/80">
              <div className="flex items-center gap-4 min-w-0">
                <span className="grid place-items-center w-12 h-12 rounded-full bg-white text-black shrink-0">
                  <UserRoundPlus size={22} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-tight">Thêm khách hàng</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isLeader ? "Leader có thể chỉ định người phụ trách ngay khi tạo." : "Khách hàng bạn thêm sẽ tự động do bạn phụ trách."}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAdd(false)}
                className="grid place-items-center w-8 h-8 rounded-full border border-neutral-700 text-slate-400 hover:bg-white/10 hover:text-white shrink-0"
                aria-label="Đóng">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={addCustomer} className="p-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Tên khách hàng *</label>
                <div className="relative">
                  <UserRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="VD: Nguyễn Văn A" required
                    value={cf.name} onChange={(e) => setCf({ ...cf, name: e.target.value })} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Công ty</label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="VD: Công ty CP Tân Á"
                    value={cf.company} onChange={(e) => setCf({ ...cf, company: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">SĐT</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="09xx xxx xxx"
                    value={cf.phone} onChange={(e) => setCf({ ...cf, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Zalo</label>
                <div className="relative">
                  <MessageCircle size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="Số Zalo"
                    value={cf.zalo} onChange={(e) => setCf({ ...cf, zalo: e.target.value })} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="email@congty.vn" type="email"
                    value={cf.email} onChange={(e) => setCf({ ...cf, email: e.target.value })} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Ghi chú</label>
                <div className="relative">
                  <StickyNote size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="Nhu cầu, nguồn giới thiệu..."
                    value={cf.note} onChange={(e) => setCf({ ...cf, note: e.target.value })} />
                </div>
              </div>
              {isLeader && (
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 mb-1.5">Người phụ trách</label>
                  <div className="relative">
                    <UserRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select className={inpCls + " w-full pl-9"} value={cf.ownerId} onChange={(e) => setCf({ ...cf, ownerId: e.target.value })}>
                      <option value="">— Chưa chỉ định phụ trách —</option>
                      {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-neutral-800/80">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-sm">Huỷ</button>
                <button className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Lưu khách hàng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {dealFor && (
        <div className="mb-6 space-y-2">
          <p className="font-semibold text-sm">Đơn duyệt — {dealFor.name} <span className="text-slate-500 font-normal">({dealFor.company})</span></p>
          {items.map((it, i) => (
            <div key={i} className="flex gap-2">
              <select className={selCls + " flex-1 py-2"} value={it.code}
                onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, code: e.target.value } : x)))}>
                {biz.services.map((s) => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
              </select>
              <input type="number" min="1" placeholder="Giá deal (triệu VND)" className={inpCls + " w-44"} value={it.price}
                onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
              <button onClick={() => setItems(items.filter((_, j) => j !== i))}
                className="px-3 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800">Đóng</button>
            </div>
          ))}
          <button onClick={() => setItems([...items, { code: "SW-01", price: "" }])}
            className="text-sm text-slate-400 hover:text-white hover:underline">Thêm dịch vụ</button>
          <input className={inpCls + " w-full"} placeholder="Ghi chú cho leader (nội dung chốt với khách)..."
            value={dealNote} onChange={(e) => setDealNote(e.target.value)} />
          <p className="font-semibold pt-1">Tổng deal: {money(items.reduce((s, i) => s + (Number(i.price) || 0), 0))}</p>
          <div className="flex gap-2">
            <button onClick={submitDeal} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Gửi leader duyệt</button>
            <button onClick={() => setDealFor(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800">Huỷ</button>
          </div>
        </div>
      )}

      {custMode === "kanban" && (
      <div className="flex gap-3 overflow-x-auto pb-2 items-start">
        {COLS.map((col) => {
          const cards = filteredCustomers.filter((c) => (col.statuses as readonly string[]).includes(c.status));
          return (
            <div key={col.key} className="w-64 shrink-0"
              onDragOver={(e) => { if (col.drop) e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); const id = Number(e.dataTransfer.getData("cid")); if (col.drop && id) moveCard(id, col.drop); }}>
              <p className="flex items-center gap-2 px-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-200">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                {col.label} <span className={col.cnt}>({cards.length})</span>
              </p>
              <div className={`h-0.5 rounded-full mb-3 ${col.line}`} />
              <div className="space-y-2 min-h-20">
                {cards.map((c) => {
                  const mine = c.ownerId === me?.id;
                  const deal = biz.deals.find((d) => d.customerId === c.id && d.status === "Đã duyệt" && d.employeeId === me?.id);
                  const invs = c.status === "Đã chốt" ? biz.invoices.filter((i) => i.customerId === c.id) : [];
                  return (
                    <div key={c.id} draggable={canDrag(c)}
                      onDragStart={(e) => { e.dataTransfer.setData("cid", String(c.id)); e.dataTransfer.effectAllowed = "move"; }}
                      title={(c.history || []).map((h) => `${h.at} — ${h.status}${h.method ? ` (${h.method})` : ""}${h.reason ? ` — lý do: ${h.reason}` : ""}`).join("\n")}
                      className={`select-none rounded-xl bg-white/5 p-3 ${canDrag(c) ? "cursor-grab active:cursor-grabbing hover:bg-white/10" : "opacity-90"}`}>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.company}</p>
                      <div className="text-[11px] text-slate-400 mt-1.5 space-y-0.5">
                        {Object.entries(c.contacts || {}).map(([k, v]) => <p key={k}><span className="text-slate-500 capitalize">{k}:</span> {v}</p>)}
                      </div>
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <Badge s={c.status} />
                        <span className="text-[10px] text-slate-500 truncate">{c.ownerName || "Chưa chỉ định"}</span>
                      </div>
                      {c.statusAt && <p className="text-[10px] text-slate-600 mt-1">{c.statusAt}{c.method ? ` · ${c.method}` : ""}</p>}
                      {c.status === "Đã huỷ" && c.cancelReason && (
                        <p className="text-[11px] text-red-400/80 mt-1">Lý do: {c.cancelReason}</p>
                      )}
                      <div className="mt-2 space-y-1.5">
                        {isLeader && (
                          <select className={selCls + " w-full"} value={c.ownerId ?? ""}
                            onChange={(e) => api(`/api/business/customers/${c.id}/assign`, { method: "PUT", body: JSON.stringify({ ownerId: e.target.value ? Number(e.target.value) : null }) }).then(reload)}>
                            <option value="">— Chưa chỉ định —</option>
                            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        )}
                        {c.status === "Đã liên hệ" && (mine || isLeader) && (
                          <select className={selCls + " w-full"} value={c.method || "Khác"}
                            onChange={(e) => api(`/api/business/customers/${c.id}/status`, { method: "PUT", body: JSON.stringify({ status: "Đã liên hệ", method: e.target.value }) }).then(reload)}>
                            {["Gọi điện", "Email", "Mạng xã hội", "Gặp trực tiếp", "Khác"].map((m) => <option key={m}>{m}</option>)}
                          </select>
                        )}
                        {c.status === "Chốt thành công" && mine && (
                          <button className="w-full px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold"
                            onClick={() => { setDealFor(c); setDealNote(""); setItems([{ code: "SW-01", price: "" }]); }}>
                            Gửi đơn duyệt cho leader
                          </button>
                        )}
                        {c.status === "Đã duyệt" && deal && (
                          <button className="w-full px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold"
                            onClick={() => createInvoice(deal)}>
                            Xuất hoá đơn ({money(deal.total || 0)})
                          </button>
                        )}
                        {invs.map((inv) => (
                          <button key={inv.id} className="w-full px-3 py-1.5 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs font-semibold"
                            onClick={() => printInvoice(inv)}>
                            PDF · {inv.code}
                          </button>
                        ))}
                        {c.status === "Đã chốt" && (mine || isLeader) && (
                          <button className="w-full px-3 py-1.5 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs font-semibold"
                            onClick={() => askConfirm(`Khách "${c.name}" quay lại sử dụng dịch vụ mới? Card sẽ về cột Đang deal (hoá đơn cũ vẫn giữ).`, () => moveCard(c.id, "Đang deal"))}>
                            Khách quay lại — deal mới
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Danh sách khách hàng dạng bảng */}
      {custMode === "list" && (
      <div>
        <Table head={["Khách hàng", "Liên hệ", "Trạng thái", "Người phụ trách", "Cập nhật", "Ghi chú"]}
          rows={filteredCustomers.map((c) => [
            <button key="n" className="text-left hover:underline" onClick={() => onViewCustomer(c)}>
              <p className="font-medium text-white">{c.name}</p>
              <p className="text-xs text-slate-500">{c.company}</p>
            </button>,
            <div key="ct" className="text-xs text-slate-400 space-y-0.5">
              {Object.entries(c.contacts || {}).map(([k, v]) => <p key={k}><span className="text-slate-500 capitalize">{k}:</span> {v}</p>)}
              {!Object.keys(c.contacts || {}).length && <span className="text-slate-600">—</span>}
            </div>,
            <div key="s">
              <Badge s={c.status} />
              {c.status === "Đã huỷ" && c.cancelReason && <p className="text-[10px] text-red-400/80 mt-1 max-w-40 truncate" title={c.cancelReason}>{c.cancelReason}</p>}
            </div>,
            c.ownerName || <span key="o" className="text-slate-600">Chưa chỉ định</span>,
            <span key="t" className="text-xs text-slate-500 whitespace-nowrap">{c.statusAt || "—"}</span>,
            c.note ? <span key="no" className="text-xs text-slate-400 max-w-48 truncate block" title={c.note}>{c.note}</span> : <span key="no" className="text-slate-600">—</span>,
          ])} />
        <p className="text-xs text-slate-500 mt-3">Bấm vào tên khách hàng để xem chi tiết + lịch sử giao dịch.</p>
      </div>
      )}
    </Card>
  );
}
