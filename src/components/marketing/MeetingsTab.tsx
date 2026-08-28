// Tab Lịch họp — form tạo/sửa lịch, cuốn lịch tháng, chi tiết lịch họp theo ngày (hiện dưới lịch), duyệt lịch
import { useState } from "react";
import { X, Building2, CalendarPlus, CalendarDays, Clock, MapPin, Users, PenLine, StickyNote } from "lucide-react";
import { DEPARTMENTS, Profile } from "@/lib/auth";
import { Api, Badge, Card, DOW, Me, Meeting, Mkt, Notify, inpCls, ymd } from "./shared";

export default function MeetingsTab({ mk, members, me, isLeader, api, notify, reload }: {
  mk: Mkt; members: Profile[]; me: Me; isLeader: boolean; api: Api; notify: Notify; reload: () => void;
}) {
  const [meetForm, setMeetForm] = useState<{ id?: number; title: string; time: string; room: string; note: string; participantIds: number[]; depts: string[] } | null>(null);
  const [meetMonth, setMeetMonth] = useState(0); // offset tháng cho cuốn lịch họp
  const [daySel, setDaySel] = useState<string | null>(null); // ngày đang xem toàn bộ lịch họp

  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + meetMonth, 1);
  const y = base.getFullYear(), mo = base.getMonth();
  const firstDow = (base.getDay() + 6) % 7; // T2 = 0
  const nDays = new Date(y, mo + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: nDays }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const todayS = ymd(now);
  const byDay: Record<string, Meeting[]> = {};
  for (const m of mk.meetings) { const d = (m.time || "").slice(0, 10); if (d) (byDay[d] ||= []).push(m); }
  Object.values(byDay).forEach((a) => a.sort((a2, b2) => a2.time.localeCompare(b2.time)));
  const clr = (m: Meeting) =>
    new Date(m.time.replace(" ", "T")) < now ? "border-slate-700 bg-black text-slate-400"
    : m.status === "Chờ duyệt" ? "border-yellow-500/80 bg-black text-yellow-300"
    : m.status === "Đã duyệt" ? "border-emerald-500/80 bg-black text-emerald-300"
    : "border-red-500/50 bg-black text-slate-500 line-through";

  return (
    <Card title={`Lịch họp (${mk.meetings.length})`}>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => setMeetForm({ title: "", time: "", room: "", note: "", participantIds: me ? [me.id] : [], depts: [] })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
          <CalendarPlus size={16} />Tạo lịch họp
        </button>
        {!isLeader && <span className="text-xs text-slate-500">Lịch bạn tạo sẽ chờ leader duyệt</span>}
      </div>

      {meetForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-6" onClick={() => setMeetForm(null)}>
          <div className="bg-black border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 pb-5 border-b border-neutral-800/80">
              <div className="flex items-center gap-4 min-w-0">
                <span className="grid place-items-center w-12 h-12 rounded-full bg-white text-black shrink-0">
                  <CalendarPlus size={22} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-tight">{meetForm.id ? "Sửa lịch họp" : "Tạo lịch họp"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{isLeader ? "Lịch leader tạo có hiệu lực ngay." : "Lịch bạn tạo sẽ chờ leader duyệt."}</p>
                </div>
              </div>
              <button onClick={() => setMeetForm(null)}
                className="grid place-items-center w-8 h-8 rounded-full border border-neutral-700 text-slate-400 hover:bg-white/10 hover:text-white shrink-0"
                aria-label="Đóng">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Tiêu đề cuộc họp *</label>
                <div className="relative">
                  <PenLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="VD: Họp kế hoạch tuần" value={meetForm.title}
                    onChange={(e) => setMeetForm({ ...meetForm, title: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Thời gian *</label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="datetime-local" className={inpCls + " w-full pl-9"} value={meetForm.time.replace(" ", "T")}
                      onChange={(e) => setMeetForm({ ...meetForm, time: e.target.value.replace("T", " ") })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Địa điểm / phòng họp</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input className={inpCls + " w-full pl-9"} placeholder="VD: Phòng họp A / Online" value={meetForm.room}
                      onChange={(e) => setMeetForm({ ...meetForm, room: e.target.value })} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Nội dung / ghi chú</label>
                <div className="relative">
                  <StickyNote size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className={inpCls + " w-full pl-9"} placeholder="Agenda, tài liệu cần chuẩn bị..." value={meetForm.note}
                    onChange={(e) => setMeetForm({ ...meetForm, note: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5"><Users size={13} />Nhân viên trong phòng tham gia</label>
                <div className="flex flex-wrap gap-2">
                  {members.map((mb) => (
                    <label key={mb.id} className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer ${meetForm.participantIds.includes(mb.id) ? "border-white bg-white text-black font-semibold" : "border-neutral-700 text-slate-400 hover:bg-white/10"}`}>
                      <input type="checkbox" className="hidden" checked={meetForm.participantIds.includes(mb.id)}
                        onChange={(e) => setMeetForm({ ...meetForm, participantIds: e.target.checked ? [...meetForm.participantIds, mb.id] : meetForm.participantIds.filter((x) => x !== mb.id) })} />
                      {mb.name}{mb.role === "manager" ? " (leader)" : ""}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5"><Building2 size={13} />Phòng ban khác tham gia</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DEPARTMENTS).filter(([k]) => k !== "marketing").map(([k, l]) => (
                    <label key={k} className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer ${meetForm.depts.includes(k) ? "border-white bg-white text-black font-semibold" : "border-neutral-700 text-slate-400 hover:bg-white/10"}`}>
                      <input type="checkbox" className="hidden" checked={meetForm.depts.includes(k)}
                        onChange={(e) => setMeetForm({ ...meetForm, depts: e.target.checked ? [...meetForm.depts, k] : meetForm.depts.filter((x) => x !== k) })} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800/80">
                <button onClick={() => setMeetForm(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-sm">Huỷ</button>
                <button onClick={async () => {
                  if (!meetForm.title || !meetForm.time) return notify("Nhập tiêu đề và thời gian họp");
                  const r = await api(meetForm.id ? `/api/marketing/meetings/${meetForm.id}` : "/api/marketing/meetings",
                    { method: meetForm.id ? "PUT" : "POST", body: JSON.stringify(meetForm) });
                  if (!r.ok) return notify((await r.json()).message || "Lỗi");
                  notify(meetForm.id ? "Đã lưu lịch họp" : isLeader ? "Đã tạo lịch họp" : "Đã gửi lịch họp cho leader duyệt", "success");
                  setMeetForm(null); reload();
                }} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
                  {meetForm.id ? "Lưu thay đổi" : isLeader ? "Tạo lịch họp" : "Gửi leader duyệt"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Cuốn lịch tháng ===== */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setMeetMonth(meetMonth - 1)} className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800">‹</button>
            <p className="font-semibold w-36 text-center">Tháng {mo + 1}/{y}</p>
            <button onClick={() => setMeetMonth(meetMonth + 1)} className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800">›</button>
            {meetMonth !== 0 && <button onClick={() => setMeetMonth(0)} className="px-3 py-1.5 rounded-lg border border-neutral-700 text-xs text-slate-300 hover:bg-white/10">Hôm nay</button>}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-black border border-yellow-500/80 mr-1" />Chờ duyệt</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-black border border-emerald-500/80 mr-1" />Đã duyệt</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-black border border-slate-600 mr-1" />Đã diễn ra</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-black border border-red-500/50 mr-1" />Từ chối</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-500 mb-1.5">
          {DOW.map((d) => <p key={d}>{d}</p>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="min-h-24 rounded-lg bg-slate-950/30" />;
            const key = `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isToday = key === todayS;
            const isSel = key === daySel;
            return (
              <div key={i} onClick={() => setDaySel(isSel ? null : key)}
                className={`min-h-24 rounded-xl border p-1.5 space-y-1 cursor-pointer transition ${isSel ? "ring-1 ring-white border-white/60 bg-white/5" : isToday ? "border-white/60 bg-white/5 hover:bg-white/10" : "border-slate-800 bg-slate-950/50 hover:border-white/40 hover:bg-white/[0.04]"}`}>
                <p className={`text-xs font-semibold ${isToday ? "text-white" : "text-slate-500"}`}>{d}{isToday && " · hôm nay"}</p>
                {(byDay[key] || []).map((m) => (
                  <div key={m.id} title={`${m.time} — ${m.title} (${m.status})`}
                    className={`px-1.5 py-1 rounded-md border text-[11px] leading-tight truncate ${clr(m)}`}>
                    <span className="font-semibold">{m.time.slice(11, 16)}</span> {m.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Chi tiết lịch họp của ngày được chọn — hiện ngay dưới cuốn lịch */}
        {daySel && (() => {
          const list = byDay[daySel] || [];
          const dd = new Date(daySel + "T00:00");
          const wd = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"][dd.getDay()];
          return (
            <div className="mt-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-white text-black shrink-0">
                    <CalendarDays size={19} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h4 className="font-bold tracking-tight">{wd}, {daySel.slice(8, 10)}/{daySel.slice(5, 7)}/{daySel.slice(0, 4)}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{list.length ? `${list.length} lịch họp` : "Không có lịch họp"}</p>
                  </div>
                </div>
                <button onClick={() => setDaySel(null)}
                  className="grid place-items-center w-8 h-8 rounded-full border border-neutral-700 text-slate-400 hover:bg-white/10 hover:text-white shrink-0"
                  aria-label="Đóng">
                  <X size={16} />
                </button>
              </div>

              <div className={list.length >= 2 ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
                {list.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl bg-white/5 space-y-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold flex items-center gap-2">
                        <Clock size={14} className="text-slate-500 shrink-0" />{m.time.slice(11, 16)} · {m.title}
                      </p>
                      <Badge s={m.status} />
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <MapPin size={13} className="text-slate-500 shrink-0" />{m.room || "—"} · người tạo: {m.createdByName}
                    </p>
                    {!!(m.participantNames || []).length && (
                      <p className="text-xs text-slate-400 flex items-start gap-2">
                        <Users size={13} className="text-slate-500 shrink-0 mt-0.5" />
                        <span>{(m.participantNames || []).join(", ")}{(m.depts || []).length ? " · " + (m.depts || []).map((d2) => DEPARTMENTS[d2] || d2).join(", ") : ""}</span>
                      </p>
                    )}
                    {m.note && (
                      <p className="text-xs text-slate-500 flex items-start gap-2">
                        <StickyNote size={13} className="shrink-0 mt-0.5" />{m.note}
                      </p>
                    )}
                    {(isLeader || (m.createdBy === me?.id && m.status === "Chờ duyệt")) && (
                      <div className="flex gap-2 pt-1">
                        {isLeader && m.status === "Chờ duyệt" && (
                          <>
                            <button onClick={async () => { await api(`/api/marketing/meetings/${m.id}`, { method: "PUT", body: JSON.stringify({ action: "approve" }) }); notify("Đã duyệt lịch họp", "success"); reload(); }}
                              className="px-3 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">Duyệt</button>
                            <button onClick={async () => { await api(`/api/marketing/meetings/${m.id}`, { method: "PUT", body: JSON.stringify({ action: "reject" }) }); notify("Đã từ chối lịch họp", "success"); reload(); }}
                              className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-xs font-semibold">Từ chối</button>
                          </>
                        )}
                        <button onClick={() => { setMeetForm({ id: m.id, title: m.title, time: m.time, room: m.room, note: m.note || "", participantIds: m.participantIds || [], depts: m.depts || [] }); }}
                          className="px-3 py-1 rounded-lg border border-neutral-700 text-xs text-slate-300 hover:bg-white/10">Sửa</button>
                      </div>
                    )}
                  </div>
                ))}
                {!list.length && <p className="text-sm text-slate-600">Chưa có lịch họp nào trong ngày này. Bấm “Tạo lịch họp” để thêm.</p>}
              </div>
            </div>
          );
        })()}

        {/* Lịch chờ duyệt — leader xử lý nhanh */}
        {isLeader && mk.meetings.some((m) => m.status === "Chờ duyệt") && (
          <div className="mt-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cần bạn duyệt</p>
            {mk.meetings.filter((m) => m.status === "Chờ duyệt").map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl hover:bg-white/5">
                <p className="text-sm"><span className="font-semibold">{m.title}</span> · {m.time} · người tạo: {m.createdByName}</p>
                <div className="flex gap-2">
                  <button onClick={async () => { await api(`/api/marketing/meetings/${m.id}`, { method: "PUT", body: JSON.stringify({ action: "approve" }) }); notify("Đã duyệt lịch họp", "success"); reload(); }}
                    className="px-3 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">Duyệt</button>
                  <button onClick={async () => { await api(`/api/marketing/meetings/${m.id}`, { method: "PUT", body: JSON.stringify({ action: "reject" }) }); notify("Đã từ chối lịch họp", "success"); reload(); }}
                    className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-xs font-semibold">Từ chối</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
