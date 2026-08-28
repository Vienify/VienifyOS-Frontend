// Tab Số liệu & KPI — hiệu quả chiến dịch, số liệu content, theo nhân viên, KPI leads theo tháng
import { useState } from "react";
import { Badge, Card, Me, Mkt, Put, Table, money, monthKey, monthLabel, num, selCls, ymd } from "./shared";

export default function MetricsTab({ mk, me, isLeader, put }: {
  mk: Mkt; me: Me; isLeader: boolean; put: Put;
}) {
  const [kpiMonth, setKpiMonth] = useState(0);
  const [kpiMEdit, setKpiMEdit] = useState<{ deptTarget: string; targets: Record<number, string> } | null>(null);
  const [cMonth, setCMonth] = useState(0);

  // Leads của user trong 1 tháng: chiến dịch user phụ trách đang chạy/kết thúc có thời gian phủ tháng đó
  const leadsOf = (userId: number, mkey: string) =>
    mk.campaigns.filter((c) => c.ownerId === userId && ["Đang chạy", "Kết thúc"].includes(c.status) &&
      (c.start || "").slice(0, 7) <= mkey && mkey <= (c.end || c.start || "").slice(0, 7))
      .reduce((s, c) => s + c.leads, 0);

  const mkey = monthKey(kpiMonth);
  const mt = mk.monthTargets?.[mkey] || { dept: 0, users: {} };
  const kpiRows = isLeader ? mk.kpi : mk.kpi.filter((k) => k.userId === me?.id);
  const deptLeads = mk.kpi.reduce((s, k) => s + leadsOf(k.userId, mkey), 0);
  const dPct = mt.dept ? Math.min(100, Math.round((deptLeads / mt.dept) * 100)) : 0;
  const perUser = mk.kpi.map((k) => {
    const cs = mk.campaigns.filter((c) => c.ownerId === k.userId);
    return { name: k.name, n: cs.length, leads: cs.reduce((s, c) => s + c.leads, 0), reach: cs.reduce((s, c) => s + c.reach, 0), spent: cs.reduce((s, c) => s + c.spent, 0) };
  });

  // ===== Số liệu content theo tháng =====
  const ckey = monthKey(cMonth);
  const today = ymd(new Date());
  const monthConts = mk.contents.filter((c) => c.date.slice(0, 7) === ckey);
  const CONT_STATS = [
    { st: "Viết", bar: "bg-slate-500" },
    { st: "Chờ duyệt", bar: "bg-yellow-400" },
    { st: "Đã duyệt", bar: "bg-purple-400" },
    { st: "Đã đăng", bar: "bg-emerald-400" },
  ];
  const posted = monthConts.filter((c) => c.status === "Đã đăng");
  const overdue = monthConts.filter((c) => c.status !== "Đã đăng" && c.date < today);
  const linked = monthConts.filter((c) => c.campaignId != null);
  const postRate = monthConts.length ? Math.round((posted.length / monthConts.length) * 100) : 0;
  // Theo kênh: tổng bài + đã đăng trong tháng
  const byChannel = (mk.channels || []).map((ch) => {
    const cs = monthConts.filter((c) => c.channel === ch);
    return { ch, n: cs.length, posted: cs.filter((c) => c.status === "Đã đăng").length };
  }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const maxCh = Math.max(1, ...byChannel.map((x) => x.n));
  // Theo nhân viên: bài trong tháng
  const contByUser = mk.kpi.map((k) => {
    const cs = monthConts.filter((c) => c.ownerId === k.userId);
    const p = cs.filter((c) => c.status === "Đã đăng").length;
    return {
      name: k.name, userId: k.userId, n: cs.length, posted: p,
      pending: cs.filter((c) => c.status === "Chờ duyệt").length,
      late: cs.filter((c) => c.status !== "Đã đăng" && c.date < today).length,
      rate: cs.length ? Math.round((p / cs.length) * 100) : 0,
    };
  }).filter((u) => u.n > 0).sort((a, b) => b.n - a.n);

  return (
    <>
      <Card className="mb-6" title="Hiệu quả từng chiến dịch">
        <Table head={["Chiến dịch", "Trạng thái", "Phụ trách", "Leads", "Tiếp cận", "Đã chi", "Chi phí / lead"]}
          rows={mk.campaigns.map((c) => [
            <span key="n" className="font-medium">{c.name}</span>, <Badge key="s" s={c.status} />, c.ownerName,
            num(c.leads), num(c.reach), money(c.spent),
            c.leads ? money(Number((c.spent / c.leads).toFixed(3))) : "—"])} />
      </Card>

      {/* ===== Số liệu content ===== */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <h3 className="font-bold tracking-tight mr-2">Số liệu content</h3>
          <button onClick={() => setCMonth(cMonth - 1)} className="px-3 py-1 rounded-lg border border-neutral-700 text-xs text-slate-300 hover:bg-white/10">‹</button>
          <p className="font-semibold text-sm w-28 text-center">{monthLabel(ckey)}</p>
          <button onClick={() => setCMonth(cMonth + 1)} className="px-3 py-1 rounded-lg border border-neutral-700 text-xs text-slate-300 hover:bg-white/10">›</button>
          {cMonth !== 0 && <button onClick={() => setCMonth(0)} className="px-3 py-1 rounded-lg border border-neutral-700 text-xs text-slate-300 hover:bg-white/10">Tháng này</button>}
        </div>

        {/* Chỉ số tổng quan tháng */}
        <div className="rounded-2xl border border-neutral-800 grid sm:grid-cols-2 xl:grid-cols-5 divide-y divide-neutral-800 sm:divide-y-0 sm:divide-x mb-6">
          {[
            { l: "Bài trong tháng", v: String(monthConts.length), s: `${mk.contents.length} bài toàn bộ lịch` },
            { l: "Đã đăng", v: String(posted.length), s: `tỉ lệ đăng ${postRate}%` },
            { l: "Chờ duyệt", v: String(monthConts.filter((c) => c.status === "Chờ duyệt").length), s: `${monthConts.filter((c) => c.status === "Viết").length} đang viết` },
            { l: "Trễ lịch", v: String(overdue.length), s: "quá ngày đăng mà chưa đăng" },
            { l: "Gắn chiến dịch", v: monthConts.length ? `${Math.round((linked.length / monthConts.length) * 100)}%` : "—", s: `${linked.length}/${monthConts.length} bài thuộc chiến dịch` },
          ].map((x) => (
            <div key={x.l} className="p-5">
              <p className="text-xs text-slate-500">{x.l}</p>
              <p className="text-xl font-bold mt-1 whitespace-nowrap">{x.v}</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{x.s}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pipeline trạng thái + theo kênh */}
          <div className="space-y-8 min-w-0">
            <div>
              <p className="text-sm font-semibold mb-3">Trạng thái bài viết trong tháng</p>
              <div className="space-y-3">
                {CONT_STATS.map(({ st, bar }) => {
                  const n = monthConts.filter((c) => c.status === st).length;
                  const w = monthConts.length ? Math.round((n / monthConts.length) * 100) : 0;
                  return (
                    <div key={st}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{st}</span>
                        <span className="text-slate-400">{n} bài{monthConts.length ? ` · ${w}%` : ""}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bar}`} style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  );
                })}
                {!monthConts.length && <p className="text-sm text-slate-500">Không có bài nào trong tháng này</p>}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">Bài theo kênh</p>
              <div className="space-y-3">
                {byChannel.map((x) => (
                  <div key={x.ch}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{x.ch}</span>
                      <span className="text-slate-400">{x.posted}/{x.n} đã đăng</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-400" style={{ width: `${(x.posted / maxCh) * 100}%` }} />
                      <div className="h-full bg-white/40" style={{ width: `${((x.n - x.posted) / maxCh) * 100}%` }} />
                    </div>
                  </div>
                ))}
                {!byChannel.length && <p className="text-sm text-slate-500">Chưa có bài trên kênh nào</p>}
              </div>
            </div>
          </div>

          {/* Content theo nhân viên */}
          <div className="min-w-0">
            <p className="text-sm font-semibold mb-3">Content theo nhân viên ({monthLabel(ckey).toLowerCase()})</p>
            <Table head={["Nhân viên", "Bài", "Đã đăng", "Chờ duyệt", "Trễ", "Tỉ lệ đăng"]}
              rows={contByUser.map((u) => [
                <span key="n" className={u.userId === me?.id ? "text-white font-medium" : "font-medium"}>{u.name}{u.userId === me?.id ? " (bạn)" : ""}</span>,
                String(u.n), String(u.posted), String(u.pending),
                u.late ? <span key="l" className="text-red-400 font-semibold">{u.late}</span> : "0",
                <span key="r" className="whitespace-nowrap">
                  <span className="inline-block w-16 h-1.5 bg-white/10 rounded-full overflow-hidden align-middle mr-2">
                    <span className="block h-full bg-emerald-400 rounded-full" style={{ width: `${u.rate}%` }} />
                  </span>{u.rate}%
                </span>,
              ])} />
            {!contByUser.length && <p className="text-sm text-slate-500">Chưa có ai có bài trong tháng này</p>}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Theo nhân viên (tất cả chiến dịch)">
          <Table head={["Nhân viên", "Chiến dịch", "Leads", "Tiếp cận", "Đã chi"]}
            rows={perUser.map((u) => [
              <span key="n" className="font-medium">{u.name}</span>, String(u.n), num(u.leads), num(u.reach), money(u.spent)])} />
        </Card>
        <Card title={isLeader ? "KPI leads theo tháng" : "KPI leads tháng của tôi"}>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => { setKpiMonth(kpiMonth - 1); setKpiMEdit(null); }} className="px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800">‹</button>
            <p className="font-semibold text-sm w-32 text-center">{monthLabel(mkey)}</p>
            <button onClick={() => { setKpiMonth(kpiMonth + 1); setKpiMEdit(null); }} className="px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800">›</button>
            {kpiMonth !== 0 && <button onClick={() => { setKpiMonth(0); setKpiMEdit(null); }} className="px-3 py-1 rounded-lg border border-neutral-700 text-xs text-slate-300 hover:bg-white/10">Tháng này</button>}
          </div>
          {isLeader && (
            <div className="mb-5 pb-4 border-b border-slate-800">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold">Cả phòng</span>
                {kpiMEdit ? (
                  <span>Mục tiêu: <input type="number" className={selCls + " w-20"} value={kpiMEdit.deptTarget}
                    onChange={(e) => setKpiMEdit({ ...kpiMEdit, deptTarget: e.target.value })} /> leads</span>
                ) : (
                  <span className="text-slate-400">{num(deptLeads)} / {mt.dept ? `${num(mt.dept)} leads · ${dPct}%` : "chưa set"}</span>
                )}
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${dPct >= 80 ? "bg-emerald-500" : dPct >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${dPct}%` }} />
              </div>
            </div>
          )}
          <div className="space-y-4">
            {kpiRows.map((k) => {
              const target = Number(mt.users?.[k.userId] ?? 0);
              const ach = leadsOf(k.userId, mkey);
              const pct = target ? Math.min(100, Math.round((ach / target) * 100)) : 0;
              return (
                <div key={k.userId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={k.userId === me?.id ? "text-white font-medium" : ""}>{k.name}{k.userId === me?.id ? " (bạn)" : ""}</span>
                    {kpiMEdit ? (
                      <input type="number" className={selCls + " w-20"} value={kpiMEdit.targets[k.userId] ?? ""}
                        onChange={(e) => setKpiMEdit({ ...kpiMEdit, targets: { ...kpiMEdit.targets, [k.userId]: e.target.value } })} />
                    ) : (
                      <span className="text-slate-400">{num(ach)} / {target ? `${num(target)} leads · ${pct}%` : "chưa set"}</span>
                    )}
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {isLeader && (
            <div className="flex gap-2 mt-5">
              {kpiMEdit ? (
                <>
                  <button onClick={async () => {
                    await put("/api/marketing/kpi", {
                      month: mkey, deptTarget: Number(kpiMEdit.deptTarget) || 0,
                      targets: Object.entries(kpiMEdit.targets).map(([userId, target]) => ({ userId: Number(userId), target: Number(target) || 0 })),
                    }, `Đã lưu KPI ${monthLabel(mkey).toLowerCase()}`);
                    setKpiMEdit(null);
                  }} className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Lưu KPI tháng</button>
                  <button onClick={() => setKpiMEdit(null)} className="px-4 py-1.5 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">Huỷ</button>
                </>
              ) : (
                <button onClick={() => setKpiMEdit({ deptTarget: mt.dept ? String(mt.dept) : "", targets: Object.fromEntries(mk.kpi.map((k) => [k.userId, mt.users?.[k.userId] != null ? String(mt.users[k.userId]) : ""])) })}
                  className="px-4 py-1.5 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">Set KPI {monthLabel(mkey).toLowerCase()}</button>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
