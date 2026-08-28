// Tab Tuyển dụng — vị trí tuyển dụng + kanban ứng viên 5 cột
import { useState } from "react";
import { DEPARTMENTS } from "@/lib/auth";
import DeptTag from "@/components/DeptTag";
import { CAND_COLS, Card, Hr, JOB_ST, Notify, Post, Put, Table, inpCls, selCls } from "./shared";

export default function RecruitTab({ hr, notify, put, post }: {
  hr: Hr; notify: Notify; put: Put; post: Post;
}) {
  const [jobForm, setJobForm] = useState<{ id?: number; title: string; dept: string; quantity: string; desc: string } | null>(null);
  const [candForm, setCandForm] = useState<{ id?: number; name: string; jobId: string; phone: string; email: string; note: string } | null>(null);

  return (
    <>
      <Card title={`Vị trí tuyển dụng (${hr.jobs.length})`}>
        <div className="mb-4">
          <button onClick={() => setJobForm(jobForm ? null : { title: "", dept: "business", quantity: "1", desc: "" })}
            className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
            {jobForm ? "Đóng form" : "Mở vị trí tuyển"}
          </button>
        </div>
        {jobForm && (
          <div className="mb-6 p-4 rounded-xl border border-neutral-800 space-y-3">
            <p className="font-semibold text-sm">{jobForm.id ? "Sửa vị trí" : "Vị trí mới"}</p>
            <div className="flex flex-wrap gap-3">
              <input className={inpCls + " w-72"} placeholder="Tên vị trí *" value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
              <select className={inpCls} value={jobForm.dept} onChange={(e) => setJobForm({ ...jobForm, dept: e.target.value })}>
                {Object.entries(DEPARTMENTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <input className={inpCls + " w-24"} type="number" min={1} placeholder="SL" value={jobForm.quantity}
                onChange={(e) => setJobForm({ ...jobForm, quantity: e.target.value })} />
            </div>
            <input className={inpCls + " w-full"} placeholder="Yêu cầu / mô tả" value={jobForm.desc}
              onChange={(e) => setJobForm({ ...jobForm, desc: e.target.value })} />
            <button onClick={async () => {
              if (!jobForm.title) return notify("Nhập tên vị trí");
              const body = { ...jobForm, quantity: Number(jobForm.quantity) || 1 };
              if (jobForm.id) { await put(`/api/hr/jobs/${jobForm.id}`, body, "Đã lưu vị trí"); }
              else { await post("/api/hr/jobs", body, "Đã mở vị trí tuyển"); }
              setJobForm(null);
            }} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
              {jobForm.id ? "Lưu thay đổi" : "Mở vị trí"}
            </button>
          </div>
        )}
        <Table head={["Vị trí", "Phòng ban", "SL", "Ứng viên", "Trạng thái", ""]}
          rows={hr.jobs.map((j) => [
            <div key="t"><p className="font-medium">{j.title}</p>{j.desc && <p className="text-xs text-slate-500">{j.desc}</p>}</div>,
            <DeptTag key="dp" dept={j.dept} />, j.quantity,
            hr.candidates.filter((c) => c.jobId === j.id && c.stage !== "Loại").length,
            <select key="s" className={`${selCls} font-semibold ${j.status === "Đang tuyển" ? "text-emerald-400" : j.status === "Tạm dừng" ? "text-amber-400" : "text-slate-400"}`}
              value={j.status} onChange={(e) => put(`/api/hr/jobs/${j.id}`, { status: e.target.value })}>
              {JOB_ST.map((x) => <option key={x}>{x}</option>)}
            </select>,
            <button key="e" onClick={() => setJobForm({ id: j.id, title: j.title, dept: j.dept, quantity: String(j.quantity), desc: j.desc })}
              className="px-2 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs">Sửa</button>,
          ])} />
      </Card>

      <Card title={`Ứng viên (${hr.candidates.length})`}>
        <div className="mb-4">
          <button onClick={() => setCandForm(candForm ? null : { name: "", jobId: String(hr.jobs.find((j) => j.status === "Đang tuyển")?.id || ""), phone: "", email: "", note: "" })}
            className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
            {candForm ? "Đóng form" : "Thêm ứng viên"}
          </button>
        </div>
        {candForm && (
          <div className="mb-6 p-4 rounded-xl border border-neutral-800 space-y-3">
            <p className="font-semibold text-sm">{candForm.id ? "Sửa ứng viên" : "Ứng viên mới (vào cột Mới)"}</p>
            <div className="flex flex-wrap gap-3">
              <input className={inpCls + " w-56"} placeholder="Họ tên *" value={candForm.name}
                onChange={(e) => setCandForm({ ...candForm, name: e.target.value })} />
              <select className={inpCls} value={candForm.jobId} onChange={(e) => setCandForm({ ...candForm, jobId: e.target.value })}>
                <option value="">— Vị trí ứng tuyển —</option>
                {hr.jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
              <input className={inpCls + " w-40"} placeholder="SĐT" value={candForm.phone}
                onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })} />
              <input className={inpCls + " w-56"} placeholder="Email" value={candForm.email}
                onChange={(e) => setCandForm({ ...candForm, email: e.target.value })} />
            </div>
            <input className={inpCls + " w-full"} placeholder="Ghi chú (CV, đánh giá...)" value={candForm.note}
              onChange={(e) => setCandForm({ ...candForm, note: e.target.value })} />
            <button onClick={async () => {
              if (!candForm.name) return notify("Nhập tên ứng viên");
              const body = { ...candForm, jobId: Number(candForm.jobId) || null };
              if (candForm.id) { await put(`/api/hr/candidates/${candForm.id}`, body, "Đã lưu ứng viên"); }
              else { await post("/api/hr/candidates", body, "Đã thêm ứng viên"); }
              setCandForm(null);
            }} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
              {candForm.id ? "Lưu thay đổi" : "Thêm ứng viên"}
            </button>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {CAND_COLS.map((col, ci) => {
            const list = hr.candidates.filter((c) => c.stage === col.st);
            return (
              <div key={col.st} className="min-w-0">
                <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  {col.st} <span className={`text-xs font-normal ${col.cnt}`}>({list.length})</span>
                </p>
                <div className={`h-0.5 rounded-full mb-3 ${col.line}`} />
                <div className="space-y-3">
                  {list.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition space-y-1.5">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.jobTitle || "—"}</p>
                      {(c.phone || c.email) && <p className="text-xs text-slate-500">{[c.phone, c.email].filter(Boolean).join(" · ")}</p>}
                      {c.note && <p className="text-xs text-slate-500">{c.note}</p>}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ci > 0 && (
                          <button onClick={() => put(`/api/hr/candidates/${c.id}`, { stage: CAND_COLS[ci - 1].st })}
                            className="px-2 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs">{CAND_COLS[ci - 1].st}</button>
                        )}
                        {ci < CAND_COLS.length - 1 && (
                          <button onClick={() => put(`/api/hr/candidates/${c.id}`, { stage: CAND_COLS[ci + 1].st })}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold ${CAND_COLS[ci + 1].st === "Loại" ? "bg-red-600/80 hover:bg-red-500" : "bg-white text-black hover:bg-neutral-200"}`}>{CAND_COLS[ci + 1].st}</button>
                        )}
                        <button onClick={() => setCandForm({ id: c.id, name: c.name, jobId: String(c.jobId || ""), phone: c.phone, email: c.email, note: c.note })}
                          className="px-2 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs">Sửa</button>
                      </div>
                    </div>
                  ))}
                  {!list.length && <p className="text-xs text-slate-600">Trống</p>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
