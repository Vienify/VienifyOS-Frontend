// Tab Lịch nội dung — cuốn lịch tháng / danh sách + form thêm/sửa bài + chi tiết bài
import { useState } from "react";
import { Api, Badge, CONT_CLR, Card, Content, DOW, Me, Mkt, Notify, Put, Table, dmy, fileToDataUrl, inpCls, ymd } from "./shared";

const emptyCont = { title: "", channel: "Facebook", date: "", campaignId: "", note: "", body: "", image: "" };

export default function ContentTab({ mk, me, isLeader, api, notify, reload, put, contSel, setContSel }: {
  mk: Mkt; me: Me; isLeader: boolean; api: Api; notify: Notify; reload: () => void; put: Put;
  contSel: number | null; setContSel: (id: number | null) => void;
}) {
  const [contForm, setContForm] = useState<(typeof emptyCont & { id?: number }) | null>(null);
  const [contMonth, setContMonth] = useState(0);
  const [contView, setContView] = useState<"cal" | "list">("cal");

  async function submitCont() {
    if (!contForm?.title || !contForm.date) return notify("Nhập tiêu đề và ngày đăng");
    if (contForm.id) return put(`/api/marketing/contents/${contForm.id}`, contForm, "Đã lưu bài").then(() => setContForm(null));
    const r = await api("/api/marketing/contents", { method: "POST", body: JSON.stringify(contForm) });
    if (!r.ok) return notify((await r.json()).message || "Lỗi");
    notify("Đã thêm bài vào lịch nội dung", "success"); setContForm(null); reload();
  }

  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + contMonth, 1);
  const y = base.getFullYear(), mo = base.getMonth();
  const firstDow = (base.getDay() + 6) % 7;
  const nDays = new Date(y, mo + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: nDays }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const todayS = ymd(now);
  const byDay: Record<string, Content[]> = {};
  for (const c of mk.contents) (byDay[c.date] ||= []).push(c);
  const sel = mk.contents.find((c) => c.id === contSel);
  return (
    <Card title={`Lịch nội dung (${mk.contents.length} bài)`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-neutral-800 p-0.5 mr-1">
            {([["cal", "Lịch"], ["list", "Danh sách"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setContView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${contView === v ? "bg-white text-black" : "text-slate-400 hover:text-white"}`}>{l}</button>
            ))}
          </div>
          {contView === "cal" && (
            <>
              <button onClick={() => setContMonth(contMonth - 1)} className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800">‹</button>
              <p className="font-semibold w-36 text-center">Tháng {mo + 1}/{y}</p>
              <button onClick={() => setContMonth(contMonth + 1)} className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800">›</button>
              {contMonth !== 0 && <button onClick={() => setContMonth(0)} className="px-3 py-1.5 rounded-lg border border-neutral-700 text-xs text-slate-300 hover:bg-white/10">Hôm nay</button>}
            </>
          )}
          <button onClick={() => setContForm(contForm ? null : { ...emptyCont, date: todayS })}
            className="ml-2 px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">{contForm ? "Đóng" : "Thêm bài"}</button>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-black border border-slate-600 mr-1" />Viết</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-black border border-yellow-500/80 mr-1" />Chờ duyệt</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-black border border-purple-500/80 mr-1" />Đã duyệt</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-black border border-emerald-500/80 mr-1" />Đã đăng</span>
        </div>
      </div>

      {contForm && (
        <div className="mb-5 p-4 rounded-xl border border-neutral-800 space-y-3">
          <p className="font-semibold text-sm">{contForm.id ? "Sửa bài" : "Bài mới"}</p>
          <div className="flex flex-wrap gap-3">
            <input className={inpCls + " w-72"} placeholder="Tiêu đề bài *" value={contForm.title}
              onChange={(e) => setContForm({ ...contForm, title: e.target.value })} />
            <select className={inpCls} value={contForm.channel} onChange={(e) => setContForm({ ...contForm, channel: e.target.value })}>
              {mk.channels.map((ch) => <option key={ch}>{ch}</option>)}
            </select>
            <input className={inpCls} type="date" value={contForm.date} onChange={(e) => setContForm({ ...contForm, date: e.target.value })} />
            <select className={inpCls} value={contForm.campaignId} onChange={(e) => setContForm({ ...contForm, campaignId: e.target.value })}>
              <option value="">— Không thuộc chiến dịch —</option>
              {mk.campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <textarea className={inpCls + " w-full min-h-24"} placeholder="Nội dung content (caption / bài viết — sau này có thể copy)" value={contForm.body}
            onChange={(e) => setContForm({ ...contForm, body: e.target.value })} />
          <div className="flex flex-wrap items-center gap-3">
            <label className="px-3 py-2 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10 cursor-pointer">
              Chọn file ảnh
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) fileToDataUrl(f, (durl) => setContForm((p) => p && { ...p, image: durl })); e.target.value = ""; }} />
            </label>
            <span className="text-xs text-slate-500">hoặc</span>
            <input className={inpCls + " w-96"} placeholder="Dán link ảnh (https://...)"
              value={contForm.image.startsWith("data:") ? "" : contForm.image}
              onChange={(e) => setContForm({ ...contForm, image: e.target.value })} />
            {contForm.image && (
              <span className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={contForm.image} alt="preview" className="h-12 rounded-lg border border-neutral-800 object-cover" />
                <button onClick={() => setContForm({ ...contForm, image: "" })}
                  className="px-2 py-1 rounded-lg border border-red-700 text-red-400 text-xs hover:bg-red-500/10">Xoá ảnh</button>
              </span>
            )}
          </div>
          <input className={inpCls + " w-full"} placeholder="Ghi chú" value={contForm.note}
            onChange={(e) => setContForm({ ...contForm, note: e.target.value })} />
          <button onClick={submitCont} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">
            {contForm.id ? "Lưu thay đổi" : "Thêm vào lịch"}
          </button>
        </div>
      )}

      {contView === "cal" ? (
        <>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-500 mb-1.5">
            {DOW.map((d) => <p key={d}>{d}</p>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="min-h-24 rounded-lg bg-slate-950/30" />;
              const key = `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const isToday = key === todayS;
              return (
                <div key={i} className={`min-h-24 rounded-lg border p-1.5 space-y-1 ${isToday ? "border-white/60 bg-white/5" : "border-slate-800 bg-slate-950/50"}`}>
                  <p className={`text-xs font-semibold ${isToday ? "text-white" : "text-slate-500"}`}>{d}{isToday && " · hôm nay"}</p>
                  {(byDay[key] || []).map((c) => (
                    <button key={c.id} onClick={() => setContSel(contSel === c.id ? null : c.id)}
                      title={`${c.title} — ${c.channel} (${c.status})`}
                      className={`w-full text-left px-1.5 py-1 rounded-md border text-[11px] leading-tight truncate hover:brightness-125 ${CONT_CLR[c.status] || ""} ${contSel === c.id ? "ring-1 ring-white" : ""}`}>
                      {c.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <Table head={["Ngày đăng", "Bài viết", "Kênh", "Chiến dịch", "Phụ trách", "Trạng thái", ""]}
          rows={[...mk.contents].sort((a, b) => a.date.localeCompare(b.date)).map((c) => [
            <span key="d" className={c.date === todayS ? "text-white font-semibold" : ""}>{dmy(c.date)}/{c.date.slice(0, 4)}{c.date === todayS ? " · hôm nay" : ""}</span>,
            <span key="t" className="font-medium">{c.title}</span>,
            <span key="c">{c.channel}</span>,
            c.campaignName || "—",
            c.ownerName,
            <Badge key="s" s={c.status} />,
            <button key="a" onClick={() => setContSel(contSel === c.id ? null : c.id)}
              className={`px-2.5 py-1 rounded-lg border text-xs ${contSel === c.id ? "border-white bg-white text-black font-semibold" : "border-neutral-700 text-slate-300 hover:bg-white/10"}`}>
              {contSel === c.id ? "Đang xem" : "Chi tiết"}
            </button>,
          ])} />
      )}

      {sel && (
        <div className="mt-4 p-4 rounded-xl bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{sel.title} <Badge s={sel.status} /></p>
            <div className="flex gap-2">
              {sel.status === "Viết" && (sel.ownerId === me?.id || isLeader) && (
                <button onClick={() => put(`/api/marketing/contents/${sel.id}`, { status: "Chờ duyệt" }, "Đã gửi leader duyệt")}
                  className="px-3 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">Gửi duyệt</button>
              )}
              {sel.status === "Chờ duyệt" && isLeader && (
                <>
                  <button onClick={() => put(`/api/marketing/contents/${sel.id}`, { status: "Đã duyệt" }, "Đã duyệt bài")}
                    className="px-3 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">Duyệt</button>
                  <button onClick={() => put(`/api/marketing/contents/${sel.id}`, { status: "Viết" }, "Đã trả bài về trạng thái Viết")}
                    className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-xs font-semibold">Trả lại</button>
                </>
              )}
              {sel.status === "Đã duyệt" && (sel.ownerId === me?.id || isLeader) && (
                <button onClick={() => put(`/api/marketing/contents/${sel.id}`, { status: "Đã đăng" }, "Đã đánh dấu đăng bài")}
                  className="px-3 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold">Đã đăng</button>
              )}
              {(sel.ownerId === me?.id || isLeader) && sel.status !== "Đã đăng" && (
                <button onClick={() => setContForm({ id: sel.id, title: sel.title, channel: sel.channel, date: sel.date, campaignId: sel.campaignId ? String(sel.campaignId) : "", note: sel.note || "", body: sel.body || "", image: sel.image || "" })}
                  className="px-3 py-1 rounded-lg border border-neutral-700 text-xs text-slate-300 hover:bg-white/10">Sửa</button>
              )}
              <button onClick={() => setContSel(null)} className="px-3 py-1 rounded-lg border border-neutral-700 text-xs text-slate-400 hover:bg-white/10">Đóng</button>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1">{sel.channel} · {dmy(sel.date)} · phụ trách: {sel.ownerName}</p>
          {sel.campaignName && <p className="text-xs text-slate-400 mt-1">Chiến dịch: {sel.campaignName}</p>}
          {sel.note && <p className="text-xs text-slate-500 mt-1">{sel.note}</p>}
          {sel.body && (
            <div className="mt-3 p-3 rounded-xl border border-neutral-800 bg-black/40 relative">
              <button onClick={() => navigator.clipboard.writeText(sel.body || "").then(() => notify("Đã copy nội dung bài viết", "success"))}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-lg border border-neutral-700 text-slate-300 text-xs hover:bg-white/10">Copy</button>
              <p className="text-xs text-slate-500 mb-1">Nội dung content:</p>
              <p className="text-sm text-slate-200 whitespace-pre-wrap pr-16">{sel.body}</p>
            </div>
          )}
          {sel.image && (
            <a href={sel.image} target="_blank" rel="noreferrer" className="inline-block mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sel.image} alt={sel.title} className="max-h-56 rounded-xl border border-neutral-800 object-cover hover:brightness-110" />
            </a>
          )}
        </div>
      )}
    </Card>
  );
}
