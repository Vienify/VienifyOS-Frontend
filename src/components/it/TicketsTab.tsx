// Tab Ticket hỗ trợ — lọc theo trạng thái, tiếp nhận / hoàn thành (kèm modal ghi chú)
import { useState } from "react";
import { Profile } from "@/lib/auth";
import DeptTag from "@/components/DeptTag";
import { Badge, Card, It, Put, TICKET_ST, Table, inpCls, selCls } from "./shared";

export default function TicketsTab({ it, members, put }: { it: It; members: Profile[]; put: Put }) {
  const [tickFilter, setTickFilter] = useState("Tất cả");
  const [tickNote, setTickNote] = useState<{ id: number; note: string } | null>(null);

  const list = it.tickets.filter((t) => tickFilter === "Tất cả" || t.status === tickFilter)
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <Card title={`Ticket hỗ trợ (${it.tickets.length})`}>
      <div className="flex flex-wrap gap-2 mb-4">
        {["Tất cả", ...TICKET_ST].map((f) => (
          <button key={f} onClick={() => setTickFilter(f)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${tickFilter === f ? "border-white bg-white text-black font-semibold" : "border-neutral-700 text-slate-400 hover:bg-white/10"}`}>
            {f} ({f === "Tất cả" ? it.tickets.length : it.tickets.filter((t) => t.status === f).length})
          </button>
        ))}
      </div>
      <Table head={["Yêu cầu", "Phòng gửi", "Ưu tiên", "Gửi lúc", "Phụ trách", "Trạng thái", ""]}
        rows={list.map((t) => [
          <div key="t" className="max-w-72">
            <p className="font-medium">{t.title}</p>
            {t.desc && <p className="text-xs text-slate-500 truncate">{t.desc}</p>}
            {t.note && <p className="text-xs text-emerald-400/80 mt-0.5">{t.note}</p>}
          </div>,
          <div key="d"><DeptTag dept={t.dept} /><p className="text-xs text-slate-500 mt-1">{t.createdByName}</p></div>,
          <Badge key="p" s={t.priority} />, <span key="a" className="text-xs">{t.at}</span>,
          t.assigneeId ? (
            <select key="as" className={selCls} value={t.assigneeId}
              onChange={(e) => put(`/api/it/tickets/${t.id}`, { assigneeId: Number(e.target.value) })}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          ) : <span key="as" className="text-xs text-slate-600">—</span>,
          <Badge key="s" s={t.status} />,
          <span key="ac" className="flex gap-1.5">
            {t.status === "Mới" && (
              <button onClick={() => put(`/api/it/tickets/${t.id}`, { status: "Đang xử lý" }, "Đã tiếp nhận ticket")}
                className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold whitespace-nowrap">Tiếp nhận</button>
            )}
            {t.status === "Đang xử lý" && (
              <button onClick={() => setTickNote({ id: t.id, note: t.note || "" })}
                className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold whitespace-nowrap">Hoàn thành</button>
            )}
            {t.status === "Hoàn thành" && (
              <button onClick={() => put(`/api/it/tickets/${t.id}`, { status: "Đang xử lý" }, "Đã mở lại ticket")}
                className="px-2.5 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs whitespace-nowrap">Mở lại</button>
            )}
          </span>,
        ])} />
      {!list.length && <p className="text-sm text-slate-500">Không có ticket nào</p>}

      {/* Modal ghi chú hoàn thành ticket */}
      {tickNote && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm grid place-items-center p-6" onClick={() => setTickNote(null)}>
          <div className="bg-black border border-neutral-800 rounded-2xl w-full max-w-sm p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold">Hoàn thành ticket</p>
            <textarea className={inpCls + " w-full min-h-20"} placeholder="Ghi chú kết quả xử lý (người gửi sẽ thấy)"
              value={tickNote.note} onChange={(e) => setTickNote({ ...tickNote, note: e.target.value })} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setTickNote(null)} className="px-4 py-2 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">Huỷ</button>
              <button onClick={async () => {
                await put(`/api/it/tickets/${tickNote.id}`, { status: "Hoàn thành", note: tickNote.note }, "Đã hoàn thành ticket");
                setTickNote(null);
              }} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Hoàn thành</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
