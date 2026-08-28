import { decodeToken } from "@/lib/auth";
import { CalendarDays, Contact, FileSignature, FolderOpen, House, TrendingUp, Users } from "lucide-react";

export type Customer = { id: number; name: string; company: string; contacts: Record<string, string>; status: string; method?: string; statusAt?: string; cancelReason?: string; history?: { status: string; method?: string; reason?: string; at: string }[]; ownerId: number | null; ownerName?: string | null; note?: string };
export type Contract = { id: number; name: string; size?: number; at?: string };
export type Deal = { id: number; customerId: number; customerName?: string; employeeId: number; employeeName?: string; note: string; items?: { code: string; name: string; price: number }[]; total?: number; status: string; at?: string; statusAt?: string; contracts?: Contract[] };
export type Invoice = { id: number; code: string; dealId?: number; customerId?: number; customerName?: string; employeeName?: string; items: { code: string; name: string; price: number }[]; total: number; date: string };
export type Sale = { employeeId: number; total: number; date: string };
export type Meeting = { id: number; title: string; time: string; room: string; note?: string; status: string; createdBy: number; createdByName?: string; participantIds: number[]; participantNames?: string[]; depts: string[] };

export type Biz = {
  services: { code: string; name: string }[];
  deptTarget: number;
  monthTargets: Record<string, { dept: number; users: Record<string, number> }>;
  customers: Customer[];
  deals: Deal[];
  invoices: Invoice[];
  sales: Sale[];
  revenue: { month: string; target: number; actual: number }[];
  kpi: { userId: number; name: string; target: number; achieved: number }[];
  meetings: Meeting[];
  documents: { id: number; name: string; type: string; size: string; updated: string; hasFile?: boolean; byName?: string | null }[];
};

export type Me = ReturnType<typeof decodeToken>;
export type Stats = { customers: number; contracts: number; approvedDeals: number; actual: number; pct: number; pipeline: Record<string, number> };
export type Api = (path: string, opts?: RequestInit) => Promise<Response>;
export type Notify = (msg: string, type?: "error" | "success") => void;

export const MENU = [
  { id: "home", label: "Trang chủ", icon: House },
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "deals", label: "Hợp đồng & Hoá đơn", icon: FileSignature },
  { id: "revenue", label: "Doanh số & KPI", icon: TrendingUp },
  { id: "meetings", label: "Lịch họp", icon: CalendarDays },
  { id: "docs", label: "Tài liệu", icon: FolderOpen },
  { id: "members", label: "Nhân viên", icon: Contact },
];

export const STATUS_CLS: Record<string, string> = {
  "Đã ký": "bg-black border border-white/60 text-slate-200", "Hiệu lực": "bg-black border border-emerald-500/80 text-slate-200",
  "Hoàn thành": "bg-black border border-emerald-500/80 text-slate-200", "Đang làm việc": "bg-black border border-emerald-500/80 text-slate-200",
  "Đã chốt": "bg-black border border-emerald-500/80 text-slate-200",
  "Đang đàm phán": "bg-black border border-purple-500/80 text-slate-200", "Chờ ký": "bg-black border border-yellow-500/80 text-slate-200",
  "Chờ duyệt": "bg-black border border-yellow-500/80 text-slate-200",
  "Tiềm năng": "bg-black border border-white/60 text-slate-200", "Đang làm": "bg-black border border-emerald-500/80 text-slate-200", "Thử việc": "bg-black border border-sky-500/80 text-slate-200",
  "Đã liên hệ": "bg-black border border-sky-500/80 text-slate-200",
  "Đã duyệt": "bg-black border border-emerald-500/80 text-slate-200",
  "Chốt thành công": "bg-black border border-emerald-500/80 text-slate-200", "Đang deal": "bg-black border border-purple-500/80 text-slate-200",
  "Hết hạn": "bg-black border border-slate-600 text-slate-400", "Quá hạn": "bg-black border border-red-500/70 text-slate-400", "Từ chối": "bg-black border border-red-500/70 text-slate-400",
  "Đã huỷ": "bg-black border border-red-500/70 text-slate-400",
  "Ngừng hợp tác": "bg-black border border-slate-600 text-slate-400", "Chưa bắt đầu": "bg-black border border-slate-600 text-slate-400",
  "Chưa liên hệ": "bg-black border border-slate-600 text-slate-400",
};

export const selCls = "bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs outline-none focus:border-white/60";
export const inpCls = "bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/60";

// Các cột Kanban: drop = trạng thái khi thả vào (null = không thả được, do flow duyệt quản lý) · dot/line/cnt = màu accent riêng từng cột
export const COLS = [
  { key: "new", label: "Vừa thêm", statuses: ["Chưa liên hệ"], drop: "Chưa liên hệ", dot: "bg-slate-400", line: "bg-slate-400/40", cnt: "text-slate-400" },
  { key: "contacted", label: "Đã liên lạc", statuses: ["Đã liên hệ"], drop: "Đã liên hệ", dot: "bg-sky-400", line: "bg-sky-400/40", cnt: "text-sky-400" },
  { key: "dealing", label: "Đang deal", statuses: ["Đang deal"], drop: "Đang deal", dot: "bg-purple-400", line: "bg-purple-400/40", cnt: "text-purple-400" },
  { key: "won", label: "Chốt thành công", statuses: ["Chốt thành công", "Chờ duyệt"], drop: "Chốt thành công", dot: "bg-yellow-400", line: "bg-yellow-400/40", cnt: "text-yellow-400" },
  { key: "invoice", label: "Xuất hoá đơn", statuses: ["Đã duyệt", "Đã chốt"], drop: null, dot: "bg-emerald-400", line: "bg-emerald-400/40", cnt: "text-emerald-400" },
  { key: "cancelled", label: "Đã huỷ", statuses: ["Đã huỷ"], drop: "Đã huỷ", dot: "bg-red-400", line: "bg-red-400/40", cnt: "text-red-400" },
] as const;
export const DRAGGABLE = ["Chưa liên hệ", "Đã liên hệ", "Đang deal", "Chốt thành công", "Đã huỷ"];

export const money = (v: number) => `${(v * 1e6).toLocaleString("vi-VN")} VND`;
// Helper ngày cho doanh số theo tuần
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const weekDays = (off: number) => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + off * 7); // về thứ 2
  return [...Array(7)].map((_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return ymd(x); });
};
export const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
export const dmy = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;

export const Badge = ({ s }: { s: string }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_CLS[s] || "bg-black border border-slate-700 text-slate-300"}`}>{s}</span>
);

export const Card = ({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) => (
  <section className={`min-w-0 ${className}`}>
    {title && <h3 className="font-bold tracking-tight mb-4">{title}</h3>}
    {children}
  </section>
);

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
            {head.map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-white/5">
              {r.map((c, j) => <td key={j} className="px-3 py-2.5">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
