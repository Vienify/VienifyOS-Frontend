// Tab Nghỉ phép — danh sách đơn, lọc theo trạng thái, duyệt / từ chối (kèm modal lý do)
import { useState } from "react";
import DeptTag from "@/components/DeptTag";
import { Badge, Card, Hr, LEAVE_ST, Put, Table, dmy, inpCls } from "./shared";

export default function LeavesTab({ hr, put }: { hr: Hr; put: Put }) {
  const [leaveFilter, setLeaveFilter] = useState("Tất cả");
  const [rejectBox, setRejectBox] = useState<{ id: number; note: string } | null>(null);

  const list = hr.leaves.filter((l) => leaveFilter === "Tất cả" || l.status === leaveFilter)
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <Card title={`Đơn nghỉ phép (${hr.leaves.length})`}>
      <div className="flex flex-wrap gap-2 mb-4">
        {["Tất cả", ...LEAVE_ST].map((f) => (
          <button key={f} onClick={() => setLeaveFilter(f)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${leaveFilter === f ? "border-white bg-white text-black font-semibold" : "border-neutral-700 text-slate-400 hover:bg-white/10"}`}>
            {f} ({f === "Tất cả" ? hr.leaves.length : hr.leaves.filter((l) => l.status === f).length})
          </button>
        ))}
      </div>
      <Table head={["Người gửi", "Loại", "Thời gian nghỉ", "Lý do", "Gửi lúc", "Trạng thái", ""]}
        rows={list.map((l) => [
          <div key="u"><p className="font-medium">{l.createdByName}</p><p className="text-xs mt-1"><DeptTag dept={l.dept} /></p></div>,
          l.type,
          <span key="d" className="whitespace-nowrap">{dmy(l.from)}{l.to !== l.from ? ` - ${dmy(l.to)}` : ""}/{l.to.slice(0, 4)}</span>,
          <div key="r" className="max-w-64">
            <p className="text-sm">{l.reason}</p>
            {l.note && <p className="text-xs text-emerald-400/80 mt-0.5">{l.note}</p>}
            {l.decidedByName && <p className="text-xs text-slate-500 mt-0.5">duyệt bởi {l.decidedByName}</p>}
          </div>,
          <span key="a" className="text-xs">{l.at}</span>,
          <Badge key="s" s={l.status} />,
          <span key="ac" className="flex gap-1.5">
            {l.status === "Chờ duyệt" && (
              <>
                <button onClick={() => put(`/api/hr/leaves/${l.id}`, { status: "Đã duyệt" }, "Đã duyệt đơn nghỉ")}
                  className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold whitespace-nowrap">Duyệt</button>
                <button onClick={() => setRejectBox({ id: l.id, note: "" })}
                  className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-xs font-semibold whitespace-nowrap">Từ chối</button>
              </>
            )}
            {l.status !== "Chờ duyệt" && (
              <button onClick={() => put(`/api/hr/leaves/${l.id}`, { status: "Chờ duyệt" }, "Đã đưa về chờ duyệt")}
                className="px-2.5 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs whitespace-nowrap">Xét lại</button>
            )}
          </span>,
        ])} />
      {!list.length && <p className="text-sm text-slate-500">Không có đơn nào</p>}

      {/* Modal từ chối đơn nghỉ */}
      {rejectBox && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm grid place-items-center p-6" onClick={() => setRejectBox(null)}>
          <div className="bg-black border border-neutral-800 rounded-2xl w-full max-w-sm p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold">Từ chối đơn nghỉ</p>
            <textarea className={inpCls + " w-full min-h-20"} placeholder="Lý do từ chối (người gửi sẽ thấy)"
              value={rejectBox.note} onChange={(e) => setRejectBox({ ...rejectBox, note: e.target.value })} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejectBox(null)} className="px-4 py-2 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">Huỷ</button>
              <button onClick={async () => {
                await put(`/api/hr/leaves/${rejectBox.id}`, { status: "Từ chối", note: rejectBox.note }, "Đã từ chối đơn nghỉ");
                setRejectBox(null);
              }} className="px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-500 text-sm font-semibold">Từ chối đơn</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
