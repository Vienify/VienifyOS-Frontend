"use client";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { API, DEPARTMENTS, decodeToken, getToken } from "@/lib/auth";
import DeptTag from "@/components/DeptTag";

type Note = {
  id: number; at: string; dept: string; deptName: string; res?: string;
  actorId: number; actorName: string; actorDept: string; message: string;
};

// Loại tài nguyên -> tab tương ứng trong workspace từng phòng
const RES_TAB: Record<string, string> = {
  customers: "customers", deals: "deals", invoices: "deals", kpi: "revenue", state: "revenue",
  meetings: "meetings", documents: "docs", campaigns: "campaigns", contents: "content",
  tickets: "tickets", projects: "projects", systems: "systems",
  jobs: "recruit", candidates: "recruit", leaves: "leaves", employees: "employees", auth: "members",
};

// Tên ngắn cho tab lọc phòng ban (panel admin)
const DEPT_SHORT: Record<string, string> = {
  "tong-cuc": "Giám Đốc", business: "Business", marketing: "Marketing", it: "IT", hr: "Nhân Sự",
};

// Phân loại thông báo theo loại tài nguyên (res)
const CAT_RES: Record<string, string[]> = {
  work: ["customers", "deals", "invoices", "kpi", "state", "campaigns", "contents", "projects", "systems", "documents", "meetings", "tickets"],
  hr: ["leaves", "jobs", "candidates", "employees", "users"],
  auth: ["auth"],
};
const CATS: [string, string][] = [
  ["all", "Tất cả"], ["work", "Công việc"], ["hr", "Nhân sự"], ["auth", "Đăng nhập"],
];

// Chuông thông báo + panel trượt từ bên phải, dùng chung cho mọi trang
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Note[]>([]);
  const [deptTab, setDeptTab] = useState("all"); // admin: lọc thông báo theo phòng ban
  const [catTab, setCatTab] = useState("all"); // lọc theo phân loại thông báo
  const [seen, setSeen] = useState(0); // mốc đã đọc hàng loạt: mọi id <= seen coi như đã đọc
  const [readIds, setReadIds] = useState<number[]>([]); // từng thông báo đã ẤN vào — chỉ hết đậm khi đã ấn
  const [mounted, setMounted] = useState(false); // tránh hydration mismatch (SSR không có token)
  const me = decodeToken(getToken());
  const seenKey = `notifSeen:${me?.id || 0}`;
  const readKey = `notifRead:${me?.id || 0}`;

  const load = useCallback(async () => {
    const t = getToken();
    if (!t) return;
    try {
      const r = await fetch(`${API}/api/notifications`, { headers: { Authorization: `Bearer ${t}` } });
      if (!r.ok) return;
      setItems(await r.json());
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
    setSeen(Number(localStorage.getItem(seenKey) || 0));
    try { setReadIds(JSON.parse(localStorage.getItem(readKey) || "[]")); } catch {}
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load, seenKey, readKey]);

  // Chưa đọc = chưa từng ẤN vào thông báo đó (và không thuộc mốc đã đọc hàng loạt)
  const isUnread = (n: Note) => n.id > seen && !readIds.includes(n.id);
  const unread = items.filter(isUnread).length;

  // SSR chưa có token/localStorage — chờ mount rồi mới render để tránh hydration mismatch
  if (!mounted) return <span className="w-[34px] h-[34px]" />;

  const openPanel = () => {
    setOpen(true);
    load();
  };

  // Đánh dấu đã đọc 1 thông báo (khi ấn vào)
  const markRead = (id: number) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const nx = [...prev, id];
      localStorage.setItem(readKey, JSON.stringify(nx));
      return nx;
    });
  };
  // Đánh dấu đã đọc toàn bộ
  const markAllRead = () => {
    if (!items[0]) return;
    localStorage.setItem(seenKey, String(items[0].id));
    localStorage.setItem(readKey, "[]");
    setSeen(items[0].id);
    setReadIds([]);
  };

  // Ấn vào thông báo -> điều hướng đến đúng trang/tab (theo quyền truy cập)
  const hrefFor = (n: Note) => {
    if (!me) return "/login";
    const admin = me.role === "admin";
    if (n.dept === "tong-cuc") return admin ? "/tong-cuc" : `/${me.department}`;
    if (!admin && me.department !== n.dept) return `/${me.department}`; // khác phòng: về trang chủ phòng mình (có mục đơn/ticket của tôi)
    let tab = RES_TAB[n.res || ""] || "";
    if (n.res === "state" && n.dept === "marketing") tab = "metrics";
    return `/${n.dept}/workspace${tab ? `?tab=${tab}` : ""}`;
  };
  const openNote = (n: Note) => {
    markRead(n.id);
    setOpen(false);
    const url = hrefFor(n);
    // Đang đứng đúng trang đích thì chỉ đóng panel, khác thì chuyển trang (full reload để workspace đọc ?tab=)
    if (url !== window.location.pathname + window.location.search) window.location.href = url;
  };

  // Nhóm thông báo theo ngày (danh sách đã sắp xếp mới nhất trước); lọc theo phòng ban (admin) + phân loại
  const isAdmin = me?.role === "admin";
  const visible = items.filter((n) =>
    (!isAdmin || deptTab === "all" || n.dept === deptTab || n.actorDept === deptTab) &&
    (catTab === "all" || (CAT_RES[catTab] || []).includes(n.res || "")));
  const groups = visible.reduce<{ day: string; list: Note[] }[]>((acc, n) => {
    const d = n.at.slice(0, 10);
    const last = acc[acc.length - 1];
    if (last && last.day === d) last.list.push(n);
    else acc.push({ day: d, list: [n] });
    return acc;
  }, []);
  const dayLabel = (d: string) => {
    // Lấy ngày theo giờ địa phương (toISOString trả UTC nên phải bù múi giờ)
    const localDay = (t: number) => new Date(t - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (d === localDay(Date.now())) return "Hôm nay";
    if (d === localDay(Date.now() - 86400000)) return "Hôm qua";
    return `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;
  };

  return (
    <>
      <button onClick={openPanel} aria-label="Thông báo"
        className="relative text-slate-200 hover:text-white transition">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Portal ra body: header có backdrop-blur làm fixed bị tính theo header thay vì màn hình */}
      {createPortal(
        <>
          {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />}
          <aside className={`fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-black border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <p className="font-semibold">Thông báo</p>
            <p className="text-xs text-slate-500">
              {me?.role === "admin" ? "Toàn bộ hoạt động của hệ thống" : `Hoạt động của ${DEPARTMENTS[me?.department || ""] || "phòng ban"}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={markAllRead}
                className="px-3 py-1.5 rounded-lg text-slate-400 text-sm hover:text-white hover:bg-white/10 transition">
                Đọc tất cả
              </button>
            )}
            <button onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800">
              Đóng
            </button>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-1.5 px-5 pt-3 pb-1.5 overflow-x-auto">
            {[["all", "Tất cả"], ...Object.keys(DEPARTMENTS).map((k) => [k, DEPT_SHORT[k] || k])].map(([k, l]) => (
              <button key={k} onClick={() => setDeptTab(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  deptTab === k ? "bg-white text-black" : "border border-slate-800 text-slate-400 hover:bg-white/10 hover:text-white"}`}>
                {l}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5 px-5 pt-1.5 pb-3 border-b border-slate-800">
          <span className="text-[11px] text-slate-600 uppercase tracking-wider shrink-0">Loại</span>
          {CATS.map(([k, l]) => (
            <button key={k} onClick={() => setCatTab(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                catTab === k ? "bg-white text-black" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {visible.length === 0 && <p className="text-sm text-slate-500 text-center py-10">Chưa có thông báo nào</p>}
          {groups.map((g) => (
            <section key={g.day} className="pb-2">
              <p className="sticky top-0 z-10 bg-black px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                {dayLabel(g.day)}
              </p>
              <div className="divide-y divide-slate-800/70">
                {g.list.map((n) => (
                  <button key={n.id} onClick={() => openNote(n)}
                    className="flex w-full items-start justify-between gap-3 text-left px-5 py-3 hover:bg-white/5 transition cursor-pointer">
                    <span className="min-w-0">
                      <p className={`text-sm leading-snug ${isUnread(n) ? "font-semibold text-white" : "text-slate-300"}`}>{n.message}</p>
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span>{n.at.slice(11)}</span>
                        <DeptTag dept={n.dept} />
                        {n.actorDept !== n.dept && <><span>từ</span><DeptTag dept={n.actorDept} /></>}
                      </p>
                    </span>
                    {isUnread(n) && (
                      <span className="shrink-0 mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-black whitespace-nowrap">
                        Chưa đọc
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
          </aside>
        </>,
        document.body
      )}
    </>
  );
}
