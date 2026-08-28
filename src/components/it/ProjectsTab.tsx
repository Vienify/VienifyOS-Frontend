// Tab Dự án & công việc — kanban 4 cột + form tạo/sửa dự án
import { useState } from "react";
import { Profile } from "@/lib/auth";
import { Card, It, Me, Notify, PROJ_COLS, Post, Put, dmy, inpCls, ymd } from "./shared";

export default function ProjectsTab({ it, members, me, notify, put, post }: {
  it: It; members: Profile[]; me: Me; notify: Notify; put: Put; post: Post;
}) {
  const [projForm, setProjForm] = useState<{ id?: number; name: string; desc: string; assigneeId: string; deadline: string } | null>(null);

  return (
    <Card title={`Dự án & công việc (${it.projects.length})`}>
      <div className="mb-4">
        <button onClick={() => setProjForm(projForm ? null : { name: "", desc: "", assigneeId: String(me?.id || ""), deadline: "" })}
          className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
          {projForm ? "Đóng form" : "Tạo dự án"}
        </button>
      </div>
      {projForm && (
        <div className="mb-6 p-4 rounded-xl border border-neutral-800 space-y-3">
          <p className="font-semibold text-sm">{projForm.id ? "Sửa dự án" : "Dự án mới (vào cột Backlog)"}</p>
          <div className="flex flex-wrap gap-3">
            <input className={inpCls + " w-72"} placeholder="Tên dự án *" value={projForm.name}
              onChange={(e) => setProjForm({ ...projForm, name: e.target.value })} />
            <select className={inpCls} value={projForm.assigneeId} onChange={(e) => setProjForm({ ...projForm, assigneeId: e.target.value })}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input className={inpCls} type="date" value={projForm.deadline} onChange={(e) => setProjForm({ ...projForm, deadline: e.target.value })} />
          </div>
          <input className={inpCls + " w-full"} placeholder="Mô tả" value={projForm.desc}
            onChange={(e) => setProjForm({ ...projForm, desc: e.target.value })} />
          <button onClick={async () => {
            if (!projForm.name) return notify("Nhập tên dự án");
            const body = { ...projForm, assigneeId: Number(projForm.assigneeId) || null };
            if (projForm.id) { await put(`/api/it/projects/${projForm.id}`, body, "Đã lưu dự án"); }
            else { await post("/api/it/projects", body, "Đã tạo dự án"); }
            setProjForm(null);
          }} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
            {projForm.id ? "Lưu thay đổi" : "Tạo dự án"}
          </button>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PROJ_COLS.map((col, ci) => {
          const list = it.projects.filter((p) => p.status === col.st);
          return (
            <div key={col.st} className="min-w-0">
              <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                {col.st} <span className={`text-xs font-normal ${col.cnt}`}>({list.length})</span>
              </p>
              <div className={`h-0.5 rounded-full mb-3 ${col.line}`} />
              <div className="space-y-3">
                {list.map((p) => {
                  const overdue = p.deadline && p.status !== "Xong" && p.deadline < ymd(new Date());
                  return (
                    <div key={p.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition space-y-1.5">
                      <p className="font-semibold text-sm">{p.name}</p>
                      {p.desc && <p className="text-xs text-slate-500">{p.desc}</p>}
                      <p className="text-xs text-slate-400">{p.assigneeName || "—"}</p>
                      {p.deadline && <p className={`text-xs ${overdue ? "text-red-400 font-semibold" : "text-slate-500"}`}>Hạn: {dmy(p.deadline)}/{p.deadline.slice(0, 4)}{overdue ? " · quá hạn!" : ""}</p>}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ci > 0 && (
                          <button onClick={() => put(`/api/it/projects/${p.id}`, { status: PROJ_COLS[ci - 1].st })}
                            className="px-2 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs">{PROJ_COLS[ci - 1].st}</button>
                        )}
                        {ci < 3 && (
                          <button onClick={() => put(`/api/it/projects/${p.id}`, { status: PROJ_COLS[ci + 1].st })}
                            className="px-2 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">{PROJ_COLS[ci + 1].st}</button>
                        )}
                        <button onClick={() => setProjForm({ id: p.id, name: p.name, desc: p.desc, assigneeId: String(p.assigneeId || ""), deadline: p.deadline })}
                          className="px-2 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs">Sửa</button>
                      </div>
                    </div>
                  );
                })}
                {!list.length && <p className="text-xs text-slate-600">Trống</p>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
