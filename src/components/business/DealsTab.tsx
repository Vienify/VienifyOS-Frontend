// Tab Hợp đồng & Hoá đơn — tìm kiếm, duyệt đơn, hợp đồng file, xuất hoá đơn
import { useState } from "react";
import { Search } from "lucide-react";
import { Api, Badge, Biz, Contract, Customer, Deal, Invoice, Me, Notify, Card, Table, inpCls, money } from "./shared";

export default function DealsTab({ biz, me, isLeader, api, reload, notify, createInvoice, printInvoice, onViewCustomer }: {
  biz: Biz; me: Me; isLeader: boolean; api: Api; reload: () => void; notify: Notify;
  createInvoice: (d: Deal) => void; printInvoice: (inv: Invoice) => void; onViewCustomer: (c: Customer) => void;
}) {
  const [dealSearch, setDealSearch] = useState(""); // tìm kiếm tab hợp đồng & hoá đơn

  // Upload file hợp đồng (base64) cho đơn đã duyệt
  function uploadContract(d: Deal, file: File) {
    const r = new FileReader();
    r.onload = async () => {
      const data = String(r.result).split(",")[1]; // bỏ prefix data:...;base64,
      const res = await api(`/api/business/deals/${d.id}/contract`, {
        method: "POST",
        body: JSON.stringify({ name: file.name, mime: file.type, data }),
      });
      if (res.ok) notify(`Đã tải lên hợp đồng "${file.name}"`, "success");
      else notify((await res.json()).message);
      reload();
    };
    r.readAsDataURL(file);
  }

  // Xem (tab mới) hoặc tải 1 file hợp đồng — fetch kèm token rồi tạo blob URL
  async function openContract(d: Deal, f: Contract, download = false) {
    const res = await api(`/api/business/deals/${d.id}/contract/${f.id}${download ? "?download=1" : ""}`);
    if (!res.ok) return notify((await res.json()).message);
    const url = URL.createObjectURL(await res.blob());
    if (download) {
      const a = document.createElement("a");
      a.href = url; a.download = f.name; a.click();
    } else window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  const q = dealSearch.trim().toLowerCase();
  const filteredDeals = !q ? biz.deals : biz.deals.filter((d) => {
    const inv = biz.invoices.find((i) => i.dealId === d.id);
    return [d.customerName, d.employeeName, d.status, d.note, inv?.code]
      .some((v) => (v || "").toLowerCase().includes(q));
  });

  return (
    <Card title={`Hợp đồng và Hoá đơn (${filteredDeals.length})`}>
      <div className="relative w-80 mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className={inpCls + " w-full pl-9"} placeholder="Tìm theo khách, nhân viên, trạng thái, mã hoá đơn..."
          value={dealSearch} onChange={(e) => setDealSearch(e.target.value)} />
      </div>
      <Table head={["Khách hàng", "Nhân viên phụ trách", "Trạng thái", "Hoá đơn", "Hợp đồng", "Hành động"]}
        rows={filteredDeals.map((d) => {
          const inv = biz.invoices.find((i) => i.dealId === d.id);
          const cust = biz.customers.find((c) => c.id === d.customerId);
          return [
            <div key="c">
              <button className="font-medium text-white hover:underline text-left"
                onClick={() => cust && onViewCustomer(cust)}>{d.customerName}</button>
              <p className="text-xs text-slate-500">Deal: {money(d.total || 0)}{d.note ? ` · ${d.note}` : ""}</p>
            </div>,
            d.employeeName,
            <div key="s">
              <Badge s={d.status} />
              {d.statusAt && <p className="text-[10px] text-slate-500 mt-1">{d.statusAt}</p>}
            </div>,
            inv ? (
              <button key="inv" onClick={() => printInvoice(inv)}
                className="font-mono text-xs text-slate-300 hover:text-white hover:underline">{inv.code}</button>
            ) : <span key="inv" className="text-xs text-slate-600">—</span>,
            <div key="hd" className="space-y-1 min-w-36">
              {(d.contracts || []).map((f) => (
                <div key={f.id} className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 truncate max-w-32" title={f.name}>{f.name}</span>
                  <button onClick={() => openContract(d, f)} className="px-1.5 py-0.5 rounded border border-slate-700 text-[11px] text-slate-300 hover:bg-slate-800"></button>
                  <button onClick={() => openContract(d, f, true)} className="px-1.5 py-0.5 rounded border border-slate-700 text-[11px] text-slate-300 hover:bg-slate-800"></button>
                </div>
              ))}
              {["Đã duyệt", "Hoàn thành"].includes(d.status) && (d.employeeId === me?.id || isLeader) && (
                <label className="inline-block px-2 py-1 rounded-lg border border-dashed border-slate-600 text-xs text-slate-400 hover:bg-slate-800 cursor-pointer">
                  Thêm hợp đồng
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={(e) => e.target.files?.[0] && uploadContract(d, e.target.files[0])} />
                </label>
              )}
              {!(d.contracts || []).length && !["Đã duyệt", "Hoàn thành"].includes(d.status) && <span className="text-xs text-slate-600">—</span>}
            </div>,
            d.status === "Chờ duyệt" && isLeader ? (
              <div key="a" className="flex gap-2">
                <button onClick={() => api(`/api/business/deals/${d.id}`, { method: "PUT", body: JSON.stringify({ action: "approve" }) }).then(reload)}
                  className="px-3 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">Duyệt</button>
                <button onClick={() => api(`/api/business/deals/${d.id}`, { method: "PUT", body: JSON.stringify({ action: "reject" }) }).then(reload)}
                  className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-xs font-semibold">Từ chối</button>
              </div>
            ) : d.status === "Đã duyệt" && d.employeeId === me?.id ? (
              <button key="i" onClick={() => createInvoice(d)}
                className="px-3 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">Xuất hoá đơn</button>
            ) : "—",
          ];
        })} />
      {!filteredDeals.length && <p className="text-sm text-slate-600 mt-3">Không tìm thấy kết quả phù hợp.</p>}
    </Card>
  );
}
