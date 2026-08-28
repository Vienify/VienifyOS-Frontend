// Tab Trang chủ Marketing — trung tâm là lịch đăng content (ấn vào → tab Lịch nội dung), các card có đường kẻ phân cách
import { ArrowRight } from "lucide-react";
import { Badge, CONT_CLR, Content, DOW, Mkt, Table, dmy, money, monthKey, num, ymd } from "./shared";

export default function HomeTab({ mk, setTab, openContent }: {
  mk: Mkt; setTab: (tab: string) => void; openContent: (id: number) => void;
}) {
  const running = mk.campaigns.filter((c) => c.status === "Đang chạy");
  const totalLeads = mk.campaigns.reduce((s, c) => s + c.leads, 0);
  const totalSpent = mk.campaigns.reduce((s, c) => s + c.spent, 0);
  const mNow = monthKey(0);
  const posted = mk.contents.filter((c) => c.status === "Đã đăng" && c.date.slice(0, 7) === mNow);
  const pendCamp = mk.campaigns.filter((c) => c.status === "Chờ duyệt");
  const pendCont = mk.contents.filter((c) => c.status === "Chờ duyệt");
  const today = ymd(new Date());
  const upcoming = mk.meetings.filter((m) => m.status === "Đã duyệt" && m.time >= today).sort((a, b) => a.time.localeCompare(b.time)).slice(0, 4);

  // Cuốn lịch tháng hiện tại — chỉ xem, ấn vào là chuyển sang tab Lịch nội dung
  const now = new Date();
  const y = now.getFullYear(), mo = now.getMonth();
  const firstDow = (new Date(y, mo, 1).getDay() + 6) % 7;
  const nDays = new Date(y, mo + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: nDays }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const byDay: Record<string, Content[]> = {};
  for (const c of mk.contents) (byDay[c.date] ||= []).push(c);

  const stats = [
    { l: "Chiến dịch đang chạy", v: String(running.length), s: `${mk.campaigns.length} chiến dịch tổng` },
    { l: "Tổng leads", v: num(totalLeads), s: "từ tất cả chiến dịch" },
    { l: "Chi phí đã dùng", v: money(totalSpent), s: `ngân sách ${money(mk.campaigns.reduce((s, c) => s + c.budget, 0))}` },
    { l: "Bài đã đăng tháng này", v: String(posted.length), s: `${mk.contents.length} bài trong lịch` },
  ];

  return (
    <>
      {/* Chỉ số tổng quan — các ô phân cách bằng đường kẻ */}
      <div className="rounded-2xl border border-neutral-800 grid sm:grid-cols-2 xl:grid-cols-4 divide-y divide-neutral-800 sm:divide-y-0 sm:divide-x">
        {stats.map((x) => (
          <div key={x.l} className="p-5">
            <p className="text-xs text-slate-500">{x.l}</p>
            <p className="text-xl font-bold mt-1 whitespace-nowrap">{x.v}</p>
            <p className="text-xs text-slate-500 mt-1">{x.s}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 p-5">
          <h3 className="font-bold tracking-tight mb-2">Cần xử lý</h3>
          <div className="divide-y divide-neutral-800 text-sm">
            {pendCamp.map((c) => (
              <button key={c.id} onClick={() => setTab("campaigns")} className="w-full text-left py-3 hover:bg-white/5 transition">
                <p className="font-medium truncate">Chiến dịch {c.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{c.ownerName} chờ duyệt · ngân sách {money(c.budget)}</p>
              </button>
            ))}
            {pendCont.map((c) => (
              <button key={c.id} onClick={() => { openContent(c.id); setTab("content"); }} className="w-full text-left py-3 hover:bg-white/5 transition">
                <p className="font-medium truncate">Bài {c.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{c.channel} · {dmy(c.date)} · {c.ownerName} chờ duyệt</p>
              </button>
            ))}
            {!pendCamp.length && !pendCont.length && <p className="py-3 text-slate-500 text-sm">Không có mục nào chờ duyệt</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 p-5">
          <h3 className="font-bold tracking-tight mb-2">Bài sắp đến lịch đăng</h3>
          <div className="divide-y divide-neutral-800 text-sm">
            {mk.contents.filter((c) => c.status !== "Đã đăng" && c.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6).map((c) => (
              <button key={c.id} onClick={() => { openContent(c.id); setTab("content"); }} className="w-full text-left py-3 hover:bg-white/5 transition">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{c.title}</p>
                  <Badge s={c.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {c.date === today ? "Hôm nay" : dmy(c.date)} · {c.channel} · {c.ownerName}{c.campaignName ? ` · ${c.campaignName}` : ""}
                </p>
              </button>
            ))}
            {!mk.contents.some((c) => c.status !== "Đã đăng" && c.date >= today) && <p className="py-3 text-slate-500 text-sm">Không có bài nào sắp đăng</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 p-5">
          <h3 className="font-bold tracking-tight mb-2">Lịch họp sắp tới</h3>
          <div className="divide-y divide-neutral-800 text-sm">
            {upcoming.map((m) => (
              <div key={m.id} className="py-3">
                <p className="font-medium">{m.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.time} · {m.room || "—"}</p>
              </div>
            ))}
            {!upcoming.length && <p className="py-3 text-slate-500 text-sm">Chưa có lịch họp sắp tới</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 p-5">
        <h3 className="font-bold tracking-tight mb-2">Chiến dịch đang chạy</h3>
        <Table head={["Chiến dịch", "Kênh", "Phụ trách", "Ngân sách", "Đã chi", "Leads", "Tiếp cận"]}
          rows={running.map((c) => [
            <span key="n" className="font-medium">{c.name}</span>, c.channels.join(", "), c.ownerName,
            money(c.budget), money(c.spent), num(c.leads), num(c.reach)])} />
        {!running.length && <p className="text-sm text-slate-500">Chưa có chiến dịch nào đang chạy</p>}
      </div>

      {/* Lịch đăng content — ấn ngày/bài để mở tab Lịch nội dung */}
      <div className="rounded-2xl border border-neutral-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-bold tracking-tight">Lịch đăng content — Tháng {mo + 1}/{y}</h3>
          <button onClick={() => setTab("content")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
            Mở lịch nội dung <ArrowRight size={15} />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 pb-2">
          {DOW.map((d) => <p key={d}>{d}</p>)}
        </div>
        <div className="grid grid-cols-7 border-t border-l border-neutral-800/80 rounded-b-xl overflow-hidden">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="min-h-24 border-b border-r border-neutral-800/80 bg-white/[0.02]" />;
            const key = `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isToday = key === today;
            return (
              <button key={i} onClick={() => setTab("content")}
                className={`min-h-24 border-b border-r border-neutral-800/80 p-1.5 space-y-1 text-left align-top hover:bg-white/5 transition ${isToday ? "bg-white/5" : ""}`}>
                <p className={`text-xs font-semibold ${isToday ? "text-white" : "text-slate-500"}`}>{d}{isToday && " · hôm nay"}</p>
                {(byDay[key] || []).map((c) => (
                  <span key={c.id} onClick={(e) => { e.stopPropagation(); openContent(c.id); setTab("content"); }}
                    title={`${c.title} — ${c.channel} (${c.status})`}
                    className={`block w-full px-1.5 py-1 rounded-md border text-[11px] leading-tight truncate hover:brightness-125 ${CONT_CLR[c.status] || ""}`}>
                    {c.title}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
