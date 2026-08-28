// Tab Doanh số & KPI — tổng quan, doanh số theo tuần, BXH, KPI tháng + KPI năm
import { useState } from "react";
import { Api, Biz, Card, Me, Notify, Sale, Table, DOW, dmy, money, selCls, weekDays, ymd } from "./shared";

export default function RevenueTab({ biz, me, isLeader, api, notify, reload }: {
  biz: Biz; me: Me; isLeader: boolean; api: Api; notify: Notify; reload: () => void;
}) {
  const [weekOff, setWeekOff] = useState(0);
  const [rankBy, setRankBy] = useState<"day" | "week" | "month" | "year">("week");
  const [kpiEdit, setKpiEdit] = useState<{ deptTarget: string; targets: Record<number, string> } | null>(null);
  const [kpiMonth, setKpiMonth] = useState(0); // offset tháng cho KPI theo tháng
  const [kpiMEdit, setKpiMEdit] = useState<{ deptTarget: string; targets: Record<number, string> } | null>(null);

  async function saveKpi() {
    await api("/api/business/kpi", {
      method: "PUT",
      body: JSON.stringify({
        deptTarget: Number(kpiEdit!.deptTarget),
        targets: Object.entries(kpiEdit!.targets).map(([userId, target]) => ({ userId: Number(userId), target: Number(target) })),
      }),
    });
    setKpiEdit(null); reload();
  }

  // Leader set KPI theo tháng (cả phòng + từng nhân viên)
  async function saveKpiMonth(month: string) {
    const r = await api("/api/business/kpi", {
      method: "PUT",
      body: JSON.stringify({
        month,
        deptTarget: Number(kpiMEdit!.deptTarget) || 0,
        targets: Object.entries(kpiMEdit!.targets).map(([userId, target]) => ({ userId: Number(userId), target: Number(target) || 0 })),
      }),
    });
    if (!r.ok) return notify((await r.json()).message || "Lỗi");
    notify(`Đã lưu KPI tháng ${Number(month.slice(5))}/${month.slice(0, 4)}`, "success");
    setKpiMEdit(null); reload();
  }

  const days = weekDays(weekOff);
  const today = ymd(new Date());
  const dOf = (s: Sale) => s.date.slice(0, 10);
  const curWeek = weekDays(0);
  const inP: Record<string, (s: Sale) => boolean> = {
    day: (s) => dOf(s) === today,
    week: (s) => curWeek.includes(dOf(s)),
    month: (s) => dOf(s).slice(0, 7) === today.slice(0, 7),
    year: () => true,
  };
  const sum = (f: (s: Sale) => boolean) => (biz.sales || []).filter(f).reduce((t, s) => t + s.total, 0);
  const cnt = (f: (s: Sale) => boolean) => (biz.sales || []).filter(f).length;
  const mine = (f: (s: Sale) => boolean) => sum((s) => s.employeeId === me?.id && f(s));
  const mcnt = (f: (s: Sale) => boolean) => cnt((s) => s.employeeId === me?.id && f(s));
  const myKpi = biz.kpi.find((k) => k.userId === me?.id);
  // Nhân viên chỉ thấy dữ liệu của mình; leader thấy cả phòng
  const kpiRows = isLeader ? biz.kpi : biz.kpi.filter((k) => k.userId === me?.id);
  const rank = biz.kpi
    .map((k) => ({
      userId: k.userId,
      name: k.name,
      total: rankBy === "year" ? k.achieved : sum((s) => s.employeeId === k.userId && inP[rankBy](s)),
      count: cnt((s) => s.employeeId === k.userId && inP[rankBy](s)),
    }))
    .sort((a, b) => b.total - a.total);
  const maxR = Math.max(1, ...rank.map((r) => r.total));

  return (
    <>
      {/* Tổng quan nhanh — nhân viên xem doanh số CỦA MÌNH là chính, leader xem cả phòng */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {[
          { label: isLeader ? "Hôm nay (cả phòng)" : "Của tôi — hôm nay", v: isLeader ? sum(inP.day) : mine(inP.day),
            sub: isLeader ? `${cnt(inP.day)} hoá đơn` : `${mcnt(inP.day)} hoá đơn` },
          { label: isLeader ? "Tuần này (cả phòng)" : "Của tôi — tuần này", v: isLeader ? sum(inP.week) : mine(inP.week),
            sub: isLeader ? `${cnt(inP.week)} hoá đơn` : `${mcnt(inP.week)} hoá đơn` },
          { label: isLeader ? "Tháng này (cả phòng)" : "Của tôi — tháng này", v: isLeader ? sum(inP.month) : mine(inP.month),
            sub: isLeader ? `${cnt(inP.month)} hoá đơn` : `${mcnt(inP.month)} hoá đơn` },
          { label: isLeader ? "Năm 2026 (cả phòng)" : "KPI năm 2026 của tôi",
            v: isLeader ? biz.kpi.reduce((t, k) => t + k.achieved, 0) : (myKpi?.achieved ?? 0),
            sub: isLeader ? `${(biz.sales || []).length} hoá đơn` : myKpi?.target ? `Mục tiêu ${money(myKpi.target)} · đạt ${Math.round((myKpi.achieved / myKpi.target) * 100)}%` : "" },
        ].map((s, i) => (
          <Card key={s.label} className={i ? "sm:border-l sm:border-white/15 sm:pl-6" : ""}>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-xl font-bold mt-1 whitespace-nowrap ${["text-sky-300", "text-emerald-300", "text-purple-300", "text-amber-300"][i]}`}>{money(s.v)}</p>
            <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Doanh số theo ngày trong tuần (nhân viên: chỉ của mình) */}
      <Card className="mb-6 border-t border-white/15 pt-8" title={`Doanh số ${isLeader ? "từng nhân viên" : "của tôi"} theo ngày — tuần ${dmy(days[0])} - ${dmy(days[6])}${weekOff === 0 ? " (tuần này)" : ""}`}>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setWeekOff(weekOff - 1)} className="px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800">‹ Tuần trước</button>
          <button onClick={() => setWeekOff(0)} disabled={weekOff === 0} className="px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40">Tuần này</button>
          <button onClick={() => setWeekOff(weekOff + 1)} disabled={weekOff >= 0} className="px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40">Tuần sau ›</button>
        </div>
        <Table
          head={["Nhân viên", ...days.map((d, i) => `${DOW[i]} ${dmy(d)}${d === today ? "*" : ""}`), "Tổng tuần"]}
          rows={[
            ...kpiRows.map((k) => {
              const own = k.userId === me?.id;
              const cells = days.map((d) => sum((s) => s.employeeId === k.userId && dOf(s) === d));
              return [
                <span key="n" className={`font-medium whitespace-nowrap ${own ? "text-white" : ""}`}>{k.name}{own ? " (bạn)" : ""}</span>,
                ...cells.map((v, i) => (
                  <span key={i} className={`text-xs whitespace-nowrap ${v ? (days[i] === today ? "text-white font-semibold" : own ? "text-slate-100" : "text-slate-300") : "text-slate-600"}`}>{v ? money(v) : "—"}</span>
                )),
                <span key="t" className={`font-semibold text-xs whitespace-nowrap ${own ? "text-white" : ""}`}>{money(cells.reduce((a, b) => a + b, 0))}</span>,
              ];
            }),
            ...(isLeader ? [[
              <span key="n" className="font-bold">Cả phòng</span>,
              ...days.map((d, i) => <span key={i} className="font-semibold text-xs whitespace-nowrap text-white">{money(sum((s) => dOf(s) === d))}</span>),
              <span key="t" className="font-bold text-xs whitespace-nowrap text-white">{money(sum((s) => days.includes(dOf(s))))}</span>,
            ]] : []),
          ]} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bảng xếp hạng */}
        <Card className="border-t border-white/15 pt-8" title="Bảng xếp hạng KPI nhân viên">
          <div className="flex flex-wrap gap-2 mb-4">
            {([["day", "Hôm nay"], ["week", "Tuần này"], ["month", "Tháng này"], ["year", "Năm 2026"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setRankBy(k)}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${rankBy === k ? "bg-white text-black" : "border border-neutral-700 text-slate-300 hover:bg-white/10"}`}>{l}</button>
            ))}
          </div>
          <div className="space-y-4">
            {rank.map((r, i) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className={i === 0 && r.total > 0 ? "font-bold text-amber-300" : r.userId === me?.id ? "font-semibold text-white" : ""}>
                    <span className="inline-block w-7">{`${i + 1}.`}</span>
                    {r.name}{r.userId === me?.id ? " (bạn)" : ""}
                  </span>
                  <span className="text-slate-400 text-xs whitespace-nowrap">{money(r.total)}{rankBy !== "year" ? ` · ${r.count} đơn` : ""}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${i === 0 ? "bg-amber-400" : "bg-white/30"}`} style={{ width: `${Math.round((r.total / maxR) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* KPI theo tháng — leader set cho cả phòng + từng nhân viên */}
        {(() => {
          const d0 = new Date(); d0.setDate(1); d0.setMonth(d0.getMonth() + kpiMonth);
          const mk = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, "0")}`;
          const mLabel = `Tháng ${d0.getMonth() + 1}/${d0.getFullYear()}`;
          const mt = biz.monthTargets?.[mk] || { dept: 0, users: {} };
          const inM = (s: Sale) => (s.date || "").slice(0, 7) === mk;
          const dAch = sum(inM);
          const dPct = mt.dept ? Math.min(100, Math.round((dAch / mt.dept) * 100)) : 0;
          return (
            <Card className="border-t border-white/15 pt-8" title={isLeader ? "KPI theo tháng" : "KPI tháng của tôi"}>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => { setKpiMonth(kpiMonth - 1); setKpiMEdit(null); }} className="px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800">‹</button>
                <p className="font-semibold text-sm w-32 text-center">{mLabel}</p>
                <button onClick={() => { setKpiMonth(kpiMonth + 1); setKpiMEdit(null); }} className="px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800">›</button>
                {kpiMonth !== 0 && <button onClick={() => { setKpiMonth(0); setKpiMEdit(null); }} className="px-3 py-1 rounded-lg border border-neutral-700 text-xs text-slate-300 hover:bg-white/10">Tháng này</button>}
              </div>

              {/* Cả phòng — chỉ leader */}
              {isLeader && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">Cả phòng — {mLabel.toLowerCase()}</span>
                    {kpiMEdit ? (
                      <span>Mục tiêu: <input type="number" className={selCls + " w-24"} value={kpiMEdit.deptTarget}
                        onChange={(e) => setKpiMEdit({ ...kpiMEdit, deptTarget: e.target.value })} /> triệu VND</span>
                    ) : (
                      <span className="text-slate-400">{money(dAch)} / {mt.dept ? money(mt.dept) : "chưa set"}{mt.dept ? ` · ${dPct}%` : ""}</span>
                    )}
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${dPct >= 80 ? "bg-emerald-400" : dPct >= 50 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${dPct}%` }} />
                  </div>
                </div>
              )}

              {/* Từng nhân viên (nhân viên chỉ thấy của mình) */}
              <div className="space-y-4">
                {kpiRows.map((k) => {
                  const target = Number(mt.users?.[k.userId] ?? 0);
                  const ach = sum((s) => s.employeeId === k.userId && inM(s));
                  const pct = target ? Math.min(100, Math.round((ach / target) * 100)) : 0;
                  return (
                    <div key={k.userId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={k.userId === me?.id ? "text-white font-medium" : ""}>{k.name}{k.userId === me?.id ? " (bạn)" : ""}</span>
                        {kpiMEdit ? (
                          <input type="number" className={selCls + " w-24"} value={kpiMEdit.targets[k.userId] ?? ""}
                            onChange={(e) => setKpiMEdit({ ...kpiMEdit, targets: { ...kpiMEdit.targets, [k.userId]: e.target.value } })} />
                        ) : (
                          <span className="text-slate-400">{money(ach)} / {target ? `${money(target)} · ${pct}%` : "chưa set"}</span>
                        )}
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {isLeader && (
                <div className="flex gap-2 mt-5">
                  {kpiMEdit ? (
                    <>
                      <button onClick={() => saveKpiMonth(mk)} className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Lưu KPI tháng</button>
                      <button onClick={() => setKpiMEdit(null)} className="px-4 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800">Huỷ</button>
                    </>
                  ) : (
                    <button onClick={() => setKpiMEdit({ deptTarget: mt.dept ? String(mt.dept) : "", targets: Object.fromEntries(biz.kpi.map((k) => [k.userId, mt.users?.[k.userId] != null ? String(mt.users[k.userId]) : ""])) })}
                      className="px-4 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800">Set KPI {mLabel.toLowerCase()}</button>
                  )}
                </div>
              )}
            </Card>
          );
        })()}

        {isLeader && (
        <Card className="border-t border-white/15 pt-8" title="Doanh số theo tháng">
          <Table head={["Tháng", "Mục tiêu", "Thực tế", "Đạt"]}
            rows={biz.revenue.map((r) => [r.month, money(r.target), money(r.actual),
              <span key="p" className={r.actual >= r.target ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                {Math.round((r.actual / r.target) * 100)}%</span>])} />
        </Card>
        )}
        <Card className="border-t border-white/15 pt-8" title={isLeader ? "KPI nhân viên (năm 2026)" : "KPI của tôi (năm 2026)"}>
          {/* KPI cả phòng — chỉ leader */}
          {isLeader && (() => {
            const sumY = biz.kpi.reduce((s, k) => s + k.achieved, 0);
            const pct = Math.min(100, Math.round((sumY / biz.deptTarget) * 100));
            return (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">Cả phòng</span>
                  {kpiEdit ? (
                    <span>Mục tiêu: <input type="number" className={selCls + " w-24"} value={kpiEdit.deptTarget}
                      onChange={(e) => setKpiEdit({ ...kpiEdit, deptTarget: e.target.value })} /> triệu VND</span>
                  ) : (
                    <span className="text-slate-400">{money(sumY)} / {money(biz.deptTarget)} · {pct}%</span>
                  )}
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })()}
          <div className="space-y-4">
            {kpiRows.map((k) => {
              const pct = k.target ? Math.min(100, Math.round((k.achieved / k.target) * 100)) : 0;
              return (
                <div key={k.userId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{k.name}</span>
                    {kpiEdit ? (
                      <input type="number" className={selCls + " w-24"} value={kpiEdit.targets[k.userId] ?? ""}
                        onChange={(e) => setKpiEdit({ ...kpiEdit, targets: { ...kpiEdit.targets, [k.userId]: e.target.value } })} />
                    ) : (
                      <span className="text-slate-400">{money(k.achieved)} / {money(k.target)} · {pct}%</span>
                    )}
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {isLeader && (
            <div className="flex gap-2 mt-5">
              {kpiEdit ? (
                <>
                  <button onClick={saveKpi} className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Lưu KPI</button>
                  <button onClick={() => setKpiEdit(null)} className="px-4 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800">Huỷ</button>
                </>
              ) : (
                <button onClick={() => setKpiEdit({ deptTarget: String(biz.deptTarget), targets: Object.fromEntries(biz.kpi.map((k) => [k.userId, String(k.target)])) })}
                  className="px-4 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800">Set KPI</button>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
