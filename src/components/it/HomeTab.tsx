// Tab Trang chủ IT — tổng quan ticket, hệ thống, dự án, lịch họp
import DeptTag from "@/components/DeptTag";
import { Badge, Card, It, Table, ymd } from "./shared";

export default function HomeTab({ it, setTab }: { it: It; setTab: (tab: string) => void }) {
  const newT = it.tickets.filter((t) => t.status === "Mới");
  const doing = it.tickets.filter((t) => t.status === "Đang xử lý");
  const projDoing = it.projects.filter((p) => p.status === "Đang làm" || p.status === "Review");
  const sysBad = it.systems.filter((s) => s.status !== "Hoạt động");
  const today = ymd(new Date());
  const upcoming = it.meetings.filter((m) => m.status === "Đã duyệt" && m.time >= today).sort((a, b) => a.time.localeCompare(b.time)).slice(0, 4);
  return (
    <>
      <div className="rounded-2xl border border-neutral-800 grid sm:grid-cols-2 xl:grid-cols-4 divide-y divide-neutral-800 sm:divide-y-0 sm:divide-x">
        {[
          { l: "Ticket mới", v: String(newT.length), s: `${doing.length} đang xử lý` },
          { l: "Dự án đang chạy", v: String(projDoing.length), s: `${it.projects.length} dự án tổng` },
          { l: "Hệ thống", v: `${it.systems.length - sysBad.length}/${it.systems.length}`, s: "đang hoạt động bình thường" },
          { l: "Sự cố / bảo trì", v: String(sysBad.length), s: sysBad.map((s) => s.name).join(", ") || "không có" },
        ].map((x) => (
          <div key={x.l} className="p-5">
            <p className="text-xs text-slate-500">{x.l}</p>
            <p className="text-xl font-bold mt-1 whitespace-nowrap">{x.v}</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{x.s}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Ticket cần tiếp nhận">
          <div className="space-y-2 text-sm">
            {newT.map((t) => (
              <button key={t.id} onClick={() => setTab("tickets")} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <div className="flex justify-between gap-2"><b className="truncate">{t.title}</b><Badge s={t.priority} /></div>
                <p className="text-xs text-slate-500 mt-0.5"><DeptTag dept={t.dept} /> · {t.createdByName} · {t.at}</p>
              </button>
            ))}
            {!newT.length && <p className="text-slate-500">Không có ticket mới </p>}
          </div>
        </Card>
        <Card title="Hệ thống cần chú ý">
          <div className="space-y-2 text-sm">
            {sysBad.map((s) => (
              <button key={s.id} onClick={() => setTab("systems")} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <div className="flex justify-between gap-2"><b>{s.name}</b><Badge s={s.status} /></div>
                {s.note && <p className="text-xs text-slate-500 mt-0.5">{s.note}</p>}
              </button>
            ))}
            {!sysBad.length && <p className="text-slate-500">Tất cả hệ thống hoạt động bình thường </p>}
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
      <Card title="Dự án đang chạy">
        <Table head={["Dự án", "Phụ trách", "Deadline", "Trạng thái"]}
          rows={projDoing.map((p) => [
            <div key="n"><p className="font-medium">{p.name}</p>{p.desc && <p className="text-xs text-slate-500">{p.desc}</p>}</div>,
            p.assigneeName || "—", p.deadline || "—", <Badge key="s" s={p.status} />])} />
        {!projDoing.length && <p className="text-sm text-slate-500">Không có dự án đang chạy</p>}
      </Card>
    </>
  );
}
