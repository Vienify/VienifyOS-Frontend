// Tab Trang chủ Nhân sự — tổng quan đơn nghỉ, tuyển dụng, lịch họp
import DeptTag from "@/components/DeptTag";
import { Badge, Card, Hr, Table, dmy, ymd } from "./shared";

export default function HomeTab({ hr, setTab }: { hr: Hr; setTab: (tab: string) => void }) {
  const pendingLeaves = hr.leaves.filter((l) => l.status === "Chờ duyệt");
  const hiring = hr.jobs.filter((j) => j.status === "Đang tuyển");
  const inPipe = hr.candidates.filter((c) => c.stage !== "Nhận việc" && c.stage !== "Loại");
  const working = hr.employees.filter((e) => e.status !== "Đã nghỉ");
  const today = ymd(new Date());
  const onLeave = hr.leaves.filter((l) => l.status === "Đã duyệt" && l.from <= today && l.to >= today);
  const upcoming = hr.meetings.filter((m) => m.status === "Đã duyệt" && m.time >= today).sort((a, b) => a.time.localeCompare(b.time)).slice(0, 4);
  return (
    <>
      <div className="rounded-2xl border border-neutral-800 grid sm:grid-cols-2 xl:grid-cols-4 divide-y divide-neutral-800 sm:divide-y-0 sm:divide-x">
        {[
          { l: "Đơn nghỉ chờ duyệt", v: String(pendingLeaves.length), s: `${onLeave.length} người đang nghỉ hôm nay` },
          { l: "Vị trí đang tuyển", v: String(hiring.length), s: `cần ${hiring.reduce((s, j) => s + j.quantity, 0)} người` },
          { l: "Ứng viên trong pipeline", v: String(inPipe.length), s: `${hr.candidates.filter((c) => c.stage === "Nhận việc").length} đã nhận việc` },
          { l: "Nhân sự công ty", v: `${working.length}/${hr.employees.length}`, s: "đang làm việc / tổng hồ sơ" },
        ].map((x) => (
          <div key={x.l} className="p-5">
            <p className="text-xs text-slate-500">{x.l}</p>
            <p className="text-xl font-bold mt-1 whitespace-nowrap">{x.v}</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{x.s}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Đơn nghỉ chờ duyệt">
          <div className="space-y-2 text-sm">
            {pendingLeaves.map((l) => (
              <button key={l.id} onClick={() => setTab("leaves")} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <div className="flex justify-between gap-2"><b className="truncate">{l.createdByName}</b><Badge s={l.type} /></div>
                <p className="text-xs text-slate-500 mt-0.5">{l.type} · {dmy(l.from)}{l.to !== l.from ? ` - ${dmy(l.to)}` : ""} · <DeptTag dept={l.dept} /></p>
              </button>
            ))}
            {!pendingLeaves.length && <p className="text-slate-500">Không có đơn chờ duyệt </p>}
          </div>
        </Card>
        <Card title="Ứng viên mới cần xử lý">
          <div className="space-y-2 text-sm">
            {hr.candidates.filter((c) => c.stage === "Mới").map((c) => (
              <button key={c.id} onClick={() => setTab("recruit")} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <div className="flex justify-between gap-2"><b className="truncate">{c.name}</b><Badge s={c.stage} /></div>
                <p className="text-xs text-slate-500 mt-0.5">{c.jobTitle || "—"} · nộp {c.at}</p>
              </button>
            ))}
            {!hr.candidates.some((c) => c.stage === "Mới") && <p className="text-slate-500">Không có ứng viên mới</p>}
          </div>
        </Card>
        <Card title="Lịch họp sắp tới">
          <div className="space-y-2 text-sm">
            {upcoming.map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-white/5">
                <p className="font-medium">{m.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.time} · {m.room || "—"}</p>
              </div>
            ))}
            {!upcoming.length && <p className="text-slate-500">Chưa có lịch họp sắp tới</p>}
          </div>
        </Card>
      </div>
      <Card title="Vị trí đang tuyển">
        <Table head={["Vị trí", "Phòng ban", "Số lượng", "Ứng viên", "Trạng thái"]}
          rows={hiring.map((j) => [
            <div key="t"><p className="font-medium">{j.title}</p>{j.desc && <p className="text-xs text-slate-500">{j.desc}</p>}</div>,
            <DeptTag key="dp" dept={j.dept} />, j.quantity,
            hr.candidates.filter((c) => c.jobId === j.id && c.stage !== "Loại").length,
            <Badge key="s" s={j.status} />])} />
        {!hiring.length && <p className="text-sm text-slate-500">Không có vị trí đang tuyển</p>}
      </Card>
    </>
  );
}
