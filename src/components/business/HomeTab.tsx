// Tab Trang chủ — dashboard tổng quan của phòng ban
import { Badge, Biz, Card, Invoice, Sale, Stats, dmy, money, ymd } from "./shared";

export default function HomeTab({ biz, stats, setTab, printInvoice }: {
  biz: Biz; stats: Stats; setTab: (tab: string) => void; printInvoice: (inv: Invoice) => void;
}) {
  const maxRev = Math.max(...biz.revenue.map((r) => Math.max(r.actual, r.target)));
  const todayS = ymd(new Date());
  const monthS = todayS.slice(0, 7);
  const sales = biz.sales || [];
  const dOf = (s: Sale) => s.date.slice(0, 10);
  const sSum = (f: (s: Sale) => boolean) => sales.filter(f).reduce((t, s) => t + s.total, 0);
  const last7 = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return ymd(d); });
  const daySums = last7.map((d) => sSum((s) => dOf(s) === d));
  const maxDay = Math.max(1, ...daySums);
  const top = biz.kpi
    .map((k) => ({ name: k.name, total: sSum((s) => s.employeeId === k.userId && dOf(s).slice(0, 7) === monthS) }))
    .sort((a, b) => b.total - a.total).slice(0, 3);
  const maxTop = Math.max(1, ...top.map((t) => t.total));
  const recentInvs = [...biz.invoices].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const nextMeets = biz.meetings.filter((m) => m.status === "Đã duyệt" && m.time >= todayS).sort((a, b) => a.time.localeCompare(b.time)).slice(0, 4);
  const todo = biz.deals.filter((d) => ["Chờ duyệt", "Đã duyệt"].includes(d.status)).slice(0, 5);
  const PIPE_ORDER = ["Chưa liên hệ", "Đã liên hệ", "Đang deal", "Chốt thành công", "Chờ duyệt", "Đã duyệt", "Đã chốt", "Đã huỷ"];
  const PIPE_BAR: Record<string, string> = {
    "Chưa liên hệ": "bg-slate-500", "Đã liên hệ": "bg-sky-400", "Đang deal": "bg-purple-400",
    "Chốt thành công": "bg-emerald-400", "Chờ duyệt": "bg-yellow-400", "Đã duyệt": "bg-emerald-400",
    "Đã chốt": "bg-emerald-400", "Đã huỷ": "bg-red-400",
  };
  const pipeEntries = PIPE_ORDER.filter((k) => stats.pipeline[k]).map((k) => [k, stats.pipeline[k]] as const);
  const maxPipe = Math.max(1, ...pipeEntries.map(([, n]) => n));
  return (
  <>
    {/* Thẻ tổng quan */}
    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Khách hàng", value: String(stats.customers), sub: `${stats.pipeline["Đang deal"] || 0} đang deal · ${stats.pipeline["Đã chốt"] || 0} đã chốt` },
        { label: "Doanh số tháng này", value: money(sSum((s) => dOf(s).slice(0, 7) === monthS)), sub: `hôm nay: ${money(sSum((s) => dOf(s) === todayS))}` },
        { label: "Hoá đơn", value: String(biz.invoices.length), sub: `tổng ${money(biz.invoices.reduce((t, i) => t + i.total, 0))}` },
        { label: "Đạt mục tiêu 2026", value: `${stats.pct}%`, sub: `${money(stats.actual)} luỹ kế`, bar: stats.pct },
      ].map((s, i) => (
        <Card key={s.label} className={i ? "sm:border-l sm:border-white/15 sm:pl-6" : ""}>
          <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">{s.label}</p>
          <p className="text-3xl font-bold tracking-tight mt-2 whitespace-nowrap">{s.value}</p>
          <p className="text-xs text-slate-500 mt-1.5">{s.sub}</p>
          {s.bar !== undefined && (
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-3">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, s.bar)}%` }} />
            </div>
          )}
        </Card>
      ))}
    </div>

    <div className="grid gap-x-12 gap-y-12 lg:grid-cols-3 border-t border-white/15 pt-10">
      <Card title="Doanh thu theo tháng" className="lg:col-span-2">
        <div className="flex items-end gap-3">
          {biz.revenue.map((r) => {
            const pctM = Math.round((r.actual / r.target) * 100);
            return (
              <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                <span className={`text-[10px] font-semibold ${r.actual >= r.target ? "text-emerald-400" : "text-slate-500"}`}>{pctM}%</span>
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <div className="w-2/5 rounded-t bg-black border-2 border-emerald-400 hover:bg-emerald-400/15" style={{ height: `${(r.actual / maxRev) * 100}%` }} title={`Thực tế: ${money(r.actual)}`} />
                  <div className="w-2/5 rounded-t bg-black border-2 border-slate-600 hover:bg-white/5" style={{ height: `${(r.target / maxRev) * 100}%` }} title={`Mục tiêu: ${money(r.target)}`} />
                </div>
                <span className="text-[10px] text-slate-500">{r.month}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-3"><span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-black border border-emerald-400 align-middle"></span> Thực tế · <span className="inline-block w-2.5 h-2.5 rounded-[2px] bg-black border border-slate-600 align-middle"></span> Mục tiêu</p>
      </Card>
      <Card title="Pipeline khách hàng" className="lg:border-l lg:border-white/15 lg:pl-8">
        <div className="space-y-3">
          {pipeEntries.map(([s, n]) => (
            <div key={s}>
              <div className="flex items-center justify-between text-sm mb-1"><Badge s={s} /><span className="font-semibold">{n}</span></div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${PIPE_BAR[s] || "bg-white/70"}`} style={{ width: `${(n / maxPipe) * 100}%` }} />
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500 pt-1">Tổng {stats.customers} khách hàng · {stats.approvedDeals} đơn đã duyệt</p>
        </div>
      </Card>
    </div>

    <div className="grid gap-x-12 gap-y-12 lg:grid-cols-3 border-t border-white/15 pt-10">
      <Card title="Doanh số 7 ngày gần nhất">
        <div className="flex items-end gap-2">
          {last7.map((d, i) => (
            <div key={d} className="flex-1 flex flex-col items-center gap-1" title={`${dmy(d)}: ${money(daySums[i])}`}>
              <div className="w-full flex items-end h-28">
                <div className={`w-full rounded-t bg-black border-2 ${d === todayS ? "border-sky-400 bg-sky-400/10" : "border-slate-700 hover:border-sky-400/60"}`} style={{ height: `${(daySums[i] / maxDay) * 100}%` }} />
              </div>
              <span className={`text-[10px] ${d === todayS ? "text-sky-300 font-bold" : "text-slate-500"}`}>{dmy(d)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">Tổng 7 ngày: <span className="font-semibold text-white">{money(daySums.reduce((a, b) => a + b, 0))}</span></p>
      </Card>
      <Card title="Top nhân viên tháng này" className="lg:border-l lg:border-white/15 lg:pl-8">
        <div className="space-y-4">
          {top.map((t, i) => (
            <div key={t.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className={i === 0 && t.total > 0 ? "font-bold text-amber-300" : ""}>
                  <span className="inline-block w-6">{`${i + 1}.`}</span>{t.name}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">{money(t.total)}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${i === 0 ? "bg-amber-400" : "bg-white/30"}`} style={{ width: `${(t.total / maxTop) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setTab("revenue")} className="mt-4 text-xs text-slate-400 hover:text-white hover:underline">Xem BXH đầy đủ </button>
      </Card>
      <Card title="Hoá đơn gần đây" className="lg:border-l lg:border-white/15 lg:pl-8">
        <ul className="space-y-3 text-sm">
          {recentInvs.map((i) => (
            <li key={i.id} className="flex justify-between gap-2">
              <div className="min-w-0">
                <button onClick={() => printInvoice(i)} className="font-mono text-xs text-slate-300 hover:text-white hover:underline truncate block">{i.code}</button>
                <p className="text-xs text-slate-500 truncate">{i.customerName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-xs whitespace-nowrap">{money(i.total)}</p>
                <p className="text-[10px] text-slate-500">{i.date.slice(0, 10)}</p>
              </div>
            </li>
          ))}
          {!recentInvs.length && <p className="text-sm text-slate-600">Chưa có hoá đơn.</p>}
        </ul>
      </Card>
    </div>

    <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2 border-t border-white/15 pt-10">
      <Card title="Lịch họp sắp tới">
        <ul className="space-y-3 text-sm">
          {nextMeets.map((m) => (
            <li key={m.id} className="flex justify-between gap-3">
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-xs text-slate-500">{(m.participantNames || []).slice(0, 3).join(", ")}{(m.participantNames || []).length > 3 ? ` +${(m.participantNames || []).length - 3}` : ""} · {m.room}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">{m.time}</span>
            </li>
          ))}
          {!nextMeets.length && <p className="text-sm text-slate-600">Không có lịch họp sắp tới.</p>}
        </ul>
        <button onClick={() => setTab("meetings")} className="mt-3 text-xs text-slate-400 hover:text-white hover:underline">Xem tất cả lịch họp </button>
      </Card>
      <Card title="Đơn cần xử lý" className="lg:border-l lg:border-white/15 lg:pl-8">
        <ul className="space-y-3 text-sm">
          {todo.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{d.customerName} — {money(d.total || 0)}</p>
                <p className="text-xs text-slate-500">{d.status === "Chờ duyệt" ? "chờ leader duyệt" : "đã duyệt — cần xuất hoá đơn"} · NV: {d.employeeName}</p>
              </div>
              <Badge s={d.status} />
            </li>
          ))}
          {!todo.length && <p className="text-sm text-slate-600">Không có đơn tồn đọng.</p>}
        </ul>
        <button onClick={() => setTab("deals")} className="mt-3 text-xs text-slate-400 hover:text-white hover:underline">Xem hợp đồng & hoá đơn </button>
      </Card>
    </div>
  </>
  );
}
