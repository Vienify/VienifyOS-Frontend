// Modal chi tiết khách hàng: thông tin + giao dịch trước đây + timeline lịch sử trạng thái
import { X, Building2, UserRound, Activity, Phone, Mail, MessageCircle, StickyNote, AlertCircle, Receipt, History, Contact } from "lucide-react";
import { Badge, Biz, Customer, Invoice, money } from "./shared";

export default function CustomerModal({ cust, biz, printInvoice, onClose }: {
  cust: Customer; biz: Biz; printInvoice: (inv: Invoice) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-6" onClick={onClose}>
      <div className="bg-black border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-5 border-b border-neutral-800/80">
          <div className="flex items-center gap-4 min-w-0">
            <span className="grid place-items-center w-12 h-12 rounded-full bg-white text-black shrink-0">
              <Building2 size={22} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-bold tracking-tight truncate">{cust.name}</h3>
              <p className="text-sm text-slate-500 truncate">{cust.company}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="grid place-items-center w-8 h-8 rounded-full border border-neutral-700 text-slate-400 hover:bg-white/10 hover:text-white shrink-0"
            aria-label="Đóng">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Thông tin chính */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <Activity size={16} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Trạng thái</p>
                <Badge s={cust.status} />
                {cust.statusAt && <p className="text-[10px] text-slate-500 mt-1">{cust.statusAt}</p>}
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <UserRound size={16} className="text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Người phụ trách</p>
                <p className="text-slate-200">{cust.ownerName || "Chưa chỉ định"}</p>
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-1.5">Liên hệ</p>
              <div className="space-y-1.5">
                {Object.entries(cust.contacts || {}).map(([k, v]) => {
                  const Ic = k === "phone" ? Phone : k === "email" ? Mail : k === "zalo" ? MessageCircle : Contact;
                  return (
                    <p key={k} className="flex items-center gap-2.5 text-slate-300">
                      <Ic size={15} className="text-slate-500 shrink-0" />
                      <span className="text-slate-500 capitalize w-14">{k}</span>
                      <span>{v}</span>
                    </p>
                  );
                })}
              </div>
            </div>
            {cust.note && (
              <div className="col-span-2 flex items-start gap-2.5">
                <StickyNote size={16} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Ghi chú</p>
                  <p className="text-slate-300">{cust.note}</p>
                </div>
              </div>
            )}
            {cust.cancelReason && (
              <p className="col-span-2 flex items-center gap-2.5 text-red-400/90 text-sm">
                <AlertCircle size={15} className="shrink-0" />Lý do huỷ: {cust.cancelReason}
              </p>
            )}
          </div>

          {/* Giao dịch */}
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              <Receipt size={14} />Giao dịch trước đây
            </p>
            {biz.deals.filter((d) => d.customerId === cust.id).length === 0 && <p className="text-sm text-slate-600">Chưa có giao dịch.</p>}
            <div className="space-y-2">
              {biz.deals.filter((d) => d.customerId === cust.id).map((d) => {
                const inv = biz.invoices.find((i) => i.dealId === d.id);
                return (
                  <div key={d.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition text-sm">
                    <div className="flex items-center justify-between">
                      <Badge s={d.status} />
                      <span className="font-semibold">{money(d.total || 0)}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 space-y-0.5">
                      {(d.items || []).map((x) => <p key={x.code}>{x.code} · {x.name} — {money(x.price)}</p>)}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5"><UserRound size={12} />{d.employeeName}{d.statusAt ? ` · ${d.statusAt}` : ""}</span>
                      {inv && <button onClick={() => printInvoice(inv)} className="font-mono text-slate-300 hover:text-white hover:underline">{inv.code}</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline lịch sử */}
          {!!(cust.history || []).length && (
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                <History size={14} />Lịch sử trạng thái
              </p>
              <div className="relative pl-5 space-y-3">
                <span className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-neutral-800" />
                {[...(cust.history || [])].reverse().map((h, i) => (
                  <div key={i} className="relative text-xs">
                    <span className={`absolute -left-5 top-1 w-[7px] h-[7px] rounded-full ${i === 0 ? "bg-white" : "bg-neutral-600"}`} />
                    <p className={i === 0 ? "text-slate-200" : "text-slate-400"}>
                      {h.status}{h.method ? ` (${h.method})` : ""}{h.reason ? ` — lý do: ${h.reason}` : ""}
                    </p>
                    <p className="text-[10px] text-slate-600">{h.at}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
