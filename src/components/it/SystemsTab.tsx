// Tab Hạ tầng & hệ thống — danh sách hệ thống + form thêm (leader) + đổi trạng thái
import { useState } from "react";
import { Profile } from "@/lib/auth";
import { Card, It, Me, Notify, Post, Put, SYS_ST, SYS_TYPES, Table, inpCls, selCls } from "./shared";

export default function SystemsTab({ it, members, me, isLeader, notify, put, post, askConfirm }: {
  it: It; members: Profile[]; me: Me; isLeader: boolean; notify: Notify; put: Put; post: Post;
  askConfirm: (msg: string, onOk: () => void) => void;
}) {
  const [sysForm, setSysForm] = useState<{ id?: number; name: string; type: string; url: string; ownerId: string; note: string } | null>(null);

  return (
    <Card title={`Hạ tầng & hệ thống (${it.systems.length})`}>
      {isLeader && (
        <div className="mb-4">
          <button onClick={() => setSysForm(sysForm ? null : { name: "", type: "Service", url: "", ownerId: String(me?.id || ""), note: "" })}
            className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
            {sysForm ? "Đóng form" : "Thêm hệ thống"}
          </button>
        </div>
      )}
      {sysForm && (
        <div className="mb-6 p-4 rounded-xl border border-neutral-800 space-y-3">
          <div className="flex flex-wrap gap-3">
            <input className={inpCls + " w-64"} placeholder="Tên hệ thống *" value={sysForm.name}
              onChange={(e) => setSysForm({ ...sysForm, name: e.target.value })} />
            <select className={inpCls} value={sysForm.type} onChange={(e) => setSysForm({ ...sysForm, type: e.target.value })}>
              {SYS_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input className={inpCls + " w-72"} placeholder="URL (nếu có)" value={sysForm.url}
              onChange={(e) => setSysForm({ ...sysForm, url: e.target.value })} />
            <select className={inpCls} value={sysForm.ownerId} onChange={(e) => setSysForm({ ...sysForm, ownerId: e.target.value })}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <input className={inpCls + " w-full"} placeholder="Ghi chú" value={sysForm.note}
            onChange={(e) => setSysForm({ ...sysForm, note: e.target.value })} />
          <button onClick={async () => {
            if (!sysForm.name) return notify("Nhập tên hệ thống");
            await post("/api/it/systems", { ...sysForm, ownerId: Number(sysForm.ownerId) || null }, "Đã thêm hệ thống");
            setSysForm(null);
          }} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Thêm hệ thống</button>
        </div>
      )}
      <Table head={["Hệ thống", "Loại", "URL", "Phụ trách", "Ghi chú", "Trạng thái"]}
        rows={it.systems.map((s) => [
          <span key="n" className="font-medium">{s.name}</span>,
          s.type,
          s.url ? <a key="u" href={s.url} target="_blank" rel="noreferrer" className="text-slate-300 underline underline-offset-2 hover:text-white text-xs">{s.url}</a> : "—",
          s.ownerName || "—",
          <input key="note" className={selCls + " w-44"} defaultValue={s.note} placeholder="Ghi chú..."
            onBlur={(e) => e.target.value !== s.note && put(`/api/it/systems/${s.id}`, { note: e.target.value })} />,
          <select key="s" className={`${selCls} font-semibold ${s.status === "Hoạt động" ? "text-emerald-400" : s.status === "Sự cố" ? "text-red-400" : "text-amber-400"}`}
            value={s.status}
            onChange={(e) => e.target.value === "Sự cố"
              ? askConfirm(`Đánh dấu "${s.name}" đang SỰ CỐ?`, () => put(`/api/it/systems/${s.id}`, { status: "Sự cố" }, "Đã ghi nhận sự cố"))
              : put(`/api/it/systems/${s.id}`, { status: e.target.value })}>
            {SYS_ST.map((x) => <option key={x}>{x}</option>)}
          </select>,
        ])} />
    </Card>
  );
}
