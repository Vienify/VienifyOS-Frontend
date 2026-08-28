"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API, DEPARTMENTS, Profile, decodeToken, getToken } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";
import UserChip from "@/components/UserChip";
import { Biz, Customer, Deal, Invoice, MENU, money } from "@/components/business/shared";
import HomeTab from "@/components/business/HomeTab";
import CustomersTab from "@/components/business/CustomersTab";
import DealsTab from "@/components/business/DealsTab";
import RevenueTab from "@/components/business/RevenueTab";
import MeetingsTab from "@/components/business/MeetingsTab";
import DocsTab from "@/components/business/DocsTab";
import MembersTab from "@/components/business/MembersTab";
import CustomerModal from "@/components/business/CustomerModal";

export default function DeptWorkspace({ dept }: { dept: string }) {
  const [tab, setTab] = useState("home");
  const [biz, setBiz] = useState<Biz | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [meProfile, setMeProfile] = useState<Profile | null>(null);
  const [custView, setCustView] = useState<Customer | null>(null); // khách hàng đang xem chi tiết

  // Mở đúng tab khi được điều hướng từ thông báo (?tab=...)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && MENU.some((m) => m.id === t)) setTab(t);
  }, []);

  // Thông báo / xác nhận / nhập lý do — thay cho alert/confirm/prompt của trình duyệt
  const [notice, setNotice] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [confirmBox, setConfirmBox] = useState<{ msg: string; onOk: () => void } | null>(null);
  const [promptBox, setPromptBox] = useState<{ msg: string; onOk: (v: string) => void } | null>(null);
  const [promptVal, setPromptVal] = useState("");
  const notify = (msg: string, type: "error" | "success" = "error") => setNotice({ type, msg });
  const me = decodeToken(getToken());
  const isLeader = me?.role === "manager" || me?.role === "admin";

  // Mọi path "/api/business/..." được map sang phòng ban hiện tại
  const api = (path: string, opts: RequestInit = {}) =>
    fetch(`${API}${path.replace("/api/business", `/api/${dept}`)}`, { ...opts, headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } });

  const reload = () => {
    api("/api/business/data").then((r) => r.json()).then(setBiz);
    api(`/api/departments/${dept}`).then((r) => r.json()).then((d) => setMembers(d.members || []));
    api("/api/auth/me").then((r) => r.json()).then(setMeProfile);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reload, []);

  const stats = useMemo(() => {
    if (!biz) return null;
    const actual = biz.revenue.reduce((s, r) => s + r.actual, 0);
    const target = biz.revenue.reduce((s, r) => s + r.target, 0);
    const pipeline = biz.customers.reduce<Record<string, number>>((a, c) => ((a[c.status] = (a[c.status] || 0) + 1), a), {});
    return {
      customers: biz.customers.length,
      contracts: biz.deals.filter((d) => (d.contracts || []).length).length,
      approvedDeals: biz.deals.filter((d) => ["Đã duyệt", "Hoàn thành"].includes(d.status)).length,
      actual, pct: target ? Math.round((actual / target) * 100) : 0, pipeline,
    };
  }, [biz]);

  if (!biz || !stats)
    return <main className="min-h-screen bg-black text-slate-400 grid place-items-center">Đang tải dữ liệu...</main>;

  function createInvoice(d: Deal) {
    setConfirmBox({
      msg: `Xuất hoá đơn cho "${d.customerName}" theo đúng dịch vụ + giá leader đã duyệt (tổng ${money(d.total || 0)})?`,
      onOk: async () => {
        const res = await api("/api/business/invoices", { method: "POST", body: JSON.stringify({ dealId: d.id }) });
        if (res.ok) { reload(); notify("Đã xuất hoá đơn thành công", "success"); } else notify((await res.json()).message);
      },
    });
  }

  const doMove = async (id: number, status: string, reason?: string) => {
    const res = await api(`/api/business/customers/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, method: status === "Đã liên hệ" ? "Khác" : undefined, reason }),
    });
    if (!res.ok) notify((await res.json()).message);
    reload();
  };
  const moveCard = (id: number, status: string) => {
    if (status === "Đã huỷ") {
      setPromptVal("");
      setPromptBox({ msg: "Lý do huỷ khách hàng này:", onOk: (r) => doMove(id, status, r) });
      return;
    }
    doMove(id, status);
  };

  // Mở cửa sổ in - người dùng chọn "Save as PDF"
  function printInvoice(inv: Invoice) {
    const esc = (s: unknown) => String(s ?? "").replace(/[<>&"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[ch] as string));
    const vnd = (m: number) => (m * 1e6).toLocaleString("vi-VN") + " VND";
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(inv.code)}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{color:#059669;margin:0}
table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #ddd;padding:10px;text-align:left}
th{background:#f0fdf4}tfoot td{font-weight:bold;background:#f8fafc}.meta{margin-top:16px;line-height:1.8}</style></head><body>
<h1>VienifyOS</h1><p>${esc(DEPARTMENTS[dept] || dept)} — Hoá đơn dịch vụ</p>
<div class="meta"><b>Số hoá đơn:</b> ${esc(inv.code)}<br/><b>Khách hàng:</b> ${esc(inv.customerName)}<br/>
<b>Nhân viên phụ trách:</b> ${esc(inv.employeeName)}<br/><b>Ngày xuất:</b> ${esc(inv.date)}</div>
<table><thead><tr><th>Mã</th><th>Dịch vụ</th><th>Thành tiền</th></tr></thead>
<tbody>${inv.items.map((x) => `<tr><td>${esc(x.code)}</td><td>${esc(x.name)}</td><td>${vnd(x.price)}</td></tr>`).join("")}</tbody>
<tfoot><tr><td colspan="2">TỔNG CỘNG</td><td>${vnd(inv.total)}</td></tr></tfoot></table>
<script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  }

  return (
    <main className="min-h-screen bg-black text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-black/80 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <h1 className="font-bold tracking-tight">{DEPARTMENTS[dept] || dept} · Khu vực quản lý</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/${dept}`} className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition">Trang chủ phòng</Link>
            <NotificationBell />
            <UserChip />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-slate-800/80 p-3 space-y-1 sticky top-[61px] h-[calc(100vh-61px)]">
          {/* Hồ sơ nhân viên đang đăng nhập */}
          {(() => {
            const my = members.find((m) => m.id === me?.id) ?? meProfile;
            if (!my) return null;
            return (
              <div className="mb-3 px-3 pt-2 pb-4 text-center border-b border-slate-800/60">
                <span className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={my.avatar} alt={my.name} className="w-32 h-32 rounded-full object-cover bg-white ring-2 ring-white/20" />
                  {my.role === "manager" && <span className="absolute top-0 -right-3 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black text-white border border-white/60 whitespace-nowrap">LEADER</span>}
                  {my.role === "admin" && <span className="absolute top-0 -right-3 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white text-black whitespace-nowrap">FOUNDER · CEO</span>}
                </span>
                <p className="font-bold text-base text-white mt-2.5">{my.name}</p>
                <p className="text-xs text-slate-500 mt-1.5">Mã NV: {my.code}</p>
                <p className="text-xs text-slate-400 mt-0.5">{my.position}</p>
              </div>
            );
          })()}
          {MENU.map((m) => (
            <button key={m.id} onClick={() => setTab(m.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                tab === m.id ? "bg-white text-black font-semibold" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}>
              <m.icon size={17} strokeWidth={1.8} className="shrink-0" />
              {m.label}
            </button>
          ))}
        </aside>

        {/* Content — mỗi tab là một component riêng */}
        <div className="flex-1 p-6 space-y-12 min-w-0">
          {tab === "home" && <HomeTab biz={biz} stats={stats} setTab={setTab} printInvoice={printInvoice} />}

          {tab === "customers" && (
            <CustomersTab biz={biz} members={members} me={me} isLeader={isLeader} api={api} reload={reload} notify={notify}
              createInvoice={createInvoice} moveCard={moveCard} printInvoice={printInvoice}
              onViewCustomer={setCustView} askConfirm={(msg, onOk) => setConfirmBox({ msg, onOk })} />
          )}

          {tab === "deals" && (
            <DealsTab biz={biz} me={me} isLeader={isLeader} api={api} reload={reload} notify={notify}
              createInvoice={createInvoice} printInvoice={printInvoice} onViewCustomer={setCustView} />
          )}

          {tab === "revenue" && <RevenueTab biz={biz} me={me} isLeader={isLeader} api={api} notify={notify} reload={reload} />}

          {tab === "meetings" && <MeetingsTab biz={biz} members={members} me={me} isLeader={isLeader} dept={dept} api={api} notify={notify} reload={reload} />}

          {tab === "docs" && (
            <DocsTab biz={biz} isLeader={isLeader} api={api} notify={notify} reload={reload}
              askConfirm={(msg, onOk) => setConfirmBox({ msg, onOk })} />
          )}

          {tab === "members" && <MembersTab members={members} />}
        </div>
      </div>

      {/* Modal thông tin khách hàng + giao dịch trước đây */}
      {custView && <CustomerModal cust={custView} biz={biz} printInvoice={printInvoice} onClose={() => setCustView(null)} />}

      {/* ===== Modal thông báo (thay alert) ===== */}
      {notice && (
        <div className="fixed inset-0 z-[70] bg-black/60 grid place-items-center p-6" onClick={() => setNotice(null)}>
          <div className={`bg-slate-900 border rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl ${notice.type === "error" ? "border-red-500/50" : "border-white/30"}`}
            onClick={(e) => e.stopPropagation()}>
            <p className={`text-sm font-semibold ${notice.type === "error" ? "text-red-300" : "text-white"}`}>
              {notice.type === "error" ? "Có lỗi xảy ra" : "Thành công"}
            </p>
            <p className="text-sm text-slate-200">{notice.msg}</p>
            <button className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-semibold" onClick={() => setNotice(null)}>Đóng</button>
          </div>
        </div>
      )}

      {/* ===== Modal xác nhận (thay confirm) ===== */}
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

      {/* ===== Modal nhập lý do (thay prompt) ===== */}
      {promptBox && (
        <div className="fixed inset-0 z-[70] bg-black/60 grid place-items-center p-6" onClick={() => setPromptBox(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold">{promptBox.msg}</p>
            <textarea autoFocus value={promptVal} onChange={(e) => setPromptVal(e.target.value)} placeholder="Nhập lý do..."
              className="w-full h-24 resize-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500" />
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800" onClick={() => setPromptBox(null)}>Huỷ</button>
              <button disabled={!promptVal.trim()} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => { const f = promptBox.onOk; setPromptBox(null); f(promptVal.trim()); }}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
