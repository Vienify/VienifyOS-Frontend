"use client";
// Workspace phòng Marketing — shell chính: header, sidebar, điều phối tab và modal chung
// Nội dung từng tab nằm ở src/components/marketing/*
import { useEffect, useState } from "react";
import Link from "next/link";
import { API, DEPARTMENTS, Profile, decodeToken, getToken } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";
import UserChip from "@/components/UserChip";
import { MENU, Mkt } from "@/components/marketing/shared";
import HomeTab from "@/components/marketing/HomeTab";
import CampaignsTab from "@/components/marketing/CampaignsTab";
import ContentTab from "@/components/marketing/ContentTab";
import MetricsTab from "@/components/marketing/MetricsTab";
import MeetingsTab from "@/components/marketing/MeetingsTab";
import DocsTab from "@/components/marketing/DocsTab";
import MembersTab from "@/components/marketing/MembersTab";

export default function MarketingWorkspace() {
  const [tab, setTab] = useState("home");
  const [mk, setMk] = useState<Mkt | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [meProfile, setMeProfile] = useState<Profile | null>(null);
  const [contSel, setContSel] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [confirmBox, setConfirmBox] = useState<{ msg: string; onOk: () => void } | null>(null);
  const notify = (msg: string, type: "error" | "success" = "error") => setNotice({ type, msg });

  // Mở đúng tab khi được điều hướng từ thông báo (?tab=...)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && MENU.some((m) => m.id === t)) setTab(t);
  }, []);

  const me = decodeToken(getToken());
  const isLeader = me?.role === "manager" || me?.role === "admin";

  const api = (path: string, opts: RequestInit = {}) =>
    fetch(`${API}${path}`, { ...opts, headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } });
  const reload = () => {
    api("/api/marketing/data").then((r) => r.json()).then(setMk);
    api("/api/departments/marketing").then((r) => r.json()).then((d) => setMembers(d.members || []));
    api("/api/auth/me").then((r) => r.json()).then(setMeProfile);
  };
  useEffect(reload, []);

  async function put(path: string, body: object, okMsg?: string) {
    const r = await api(path, { method: "PUT", body: JSON.stringify(body) });
    if (!r.ok) return notify((await r.json()).message || "Lỗi");
    if (okMsg) notify(okMsg, "success");
    reload();
  }

  if (!mk) return <main className="min-h-screen bg-black text-slate-400 grid place-items-center">Đang tải...</main>;

  const myProfile = members.find((m) => m.id === me?.id) ?? meProfile;

  return (
    <main className="min-h-screen bg-black text-slate-100 flex flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-black/80 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <h1 className="font-bold tracking-tight">{DEPARTMENTS["marketing"]} · Khu vực quản lý</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/marketing" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition">Trang chủ phòng</Link>
            <NotificationBell />
            <UserChip />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 shrink-0 border-r border-slate-800/80 p-3 space-y-1 sticky top-[61px] h-[calc(100vh-61px)]">
          {myProfile && (
            <div className="mb-3 px-3 pt-2 pb-4 text-center border-b border-slate-800/60">
              <span className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={myProfile.avatar} alt={myProfile.name} className="w-32 h-32 rounded-full object-cover bg-white ring-2 ring-white/20" />
                {myProfile.role === "manager" && <span className="absolute top-0 -right-3 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black text-white border border-white/60 whitespace-nowrap">LEADER</span>}
                {myProfile.role === "admin" && <span className="absolute top-0 -right-3 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white text-black whitespace-nowrap">FOUNDER · CEO</span>}
              </span>
              <p className="font-bold text-base text-white mt-2.5">{myProfile.name}</p>
              <p className="text-xs text-slate-500 mt-1.5">Mã NV: {myProfile.code}</p>
              <p className="text-xs text-slate-400 mt-0.5">{myProfile.position}</p>
            </div>
          )}
          {MENU.map((m) => (
            <button key={m.id} onClick={() => setTab(m.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                tab === m.id ? "bg-white text-black font-semibold" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}>
              <m.icon size={17} strokeWidth={1.8} className="shrink-0" />
              {m.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 p-6 space-y-12 min-w-0">
          {tab === "home" && <HomeTab mk={mk} setTab={setTab} openContent={setContSel} />}
          {tab === "campaigns" && (
            <CampaignsTab mk={mk} me={me} isLeader={isLeader} api={api} notify={notify} reload={reload} put={put}
              askConfirm={(msg, onOk) => setConfirmBox({ msg, onOk })} />
          )}
          {tab === "content" && (
            <ContentTab mk={mk} me={me} isLeader={isLeader} api={api} notify={notify} reload={reload} put={put}
              contSel={contSel} setContSel={setContSel} />
          )}
          {tab === "metrics" && <MetricsTab mk={mk} me={me} isLeader={isLeader} put={put} />}
          {tab === "meetings" && (
            <MeetingsTab mk={mk} members={members} me={me} isLeader={isLeader} api={api} notify={notify} reload={reload} />
          )}
          {tab === "docs" && (
            <DocsTab mk={mk} isLeader={isLeader} api={api} notify={notify} reload={reload}
              askConfirm={(msg, onOk) => setConfirmBox({ msg, onOk })} />
          )}
          {tab === "members" && <MembersTab members={members} />}
        </div>
      </div>

      {/* Modal thông báo */}
      {notice && (
        <div className="fixed inset-0 z-[70] bg-black/60 grid place-items-center p-6" onClick={() => setNotice(null)}>
          <div className={`bg-slate-900 border rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl ${notice.type === "error" ? "border-red-500/50" : "border-emerald-500/50"}`}
            onClick={(e) => e.stopPropagation()}>
            <p className={`text-sm font-semibold ${notice.type === "error" ? "text-red-300" : "text-emerald-300"}`}>
              {notice.type === "error" ? "Có lỗi xảy ra" : "Thành công"}
            </p>
            <p className="text-sm text-slate-200">{notice.msg}</p>
            <button className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-semibold" onClick={() => setNotice(null)}>Đóng</button>
          </div>
        </div>
      )}

      {/* Modal xác nhận */}
      {confirmBox && (
        <div className="fixed inset-0 z-[70] bg-black/60 grid place-items-center p-6" onClick={() => setConfirmBox(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold">Xác nhận</p>
            <p className="text-sm text-slate-300">{confirmBox.msg}</p>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800" onClick={() => setConfirmBox(null)}>Huỷ</button>
              <button className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold"
                onClick={() => { const f = confirmBox.onOk; setConfirmBox(null); f(); }}>Đồng ý</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
