// Kiểu dữ liệu + hằng số + component UI dùng chung cho workspace IT
import { decodeToken } from "@/lib/auth";
import { CalendarDays, Contact, FolderOpen, House, LifeBuoy, ListChecks, Server } from "lucide-react";

export type Ticket = { id: number; title: string; desc: string; priority: string; dept: string; createdBy: number; createdByName?: string; status: string; assigneeId: number | null; assigneeName?: string | null; note: string; at: string; doneAt?: string };
export type Project = { id: number; name: string; desc: string; assigneeId: number | null; assigneeName?: string | null; deadline: string; status: string; at: string };
export type Sys = { id: number; name: string; type: string; url: string; status: string; ownerId: number | null; ownerName?: string | null; note: string };
export type Meeting = { id: number; title: string; time: string; room: string; note?: string; status: string; createdBy: number; createdByName?: string; participantIds: number[]; participantNames?: string[]; depts: string[] };
export type It = {
  tickets: Ticket[]; projects: Project[]; systems: Sys[]; meetings: Meeting[];
  documents: { id: number; name: string; type: string; size: string; updated: string; hasFile?: boolean; byName?: string | null }[];
};

export type Me = ReturnType<typeof decodeToken>;
export type Api = (path: string, opts?: RequestInit) => Promise<Response>;
export type Notify = (msg: string, type?: "error" | "success") => void;
export type Put = (path: string, body: object, okMsg?: string) => Promise<void>;
export type Post = (path: string, body: object, okMsg: string) => Promise<Response | void>;

export const MENU = [
  { id: "home", label: "Trang chủ", icon: House },
  { id: "tickets", label: "Ticket hỗ trợ", icon: LifeBuoy },
  { id: "projects", label: "Dự án & công việc", icon: ListChecks },
  { id: "systems", label: "Hạ tầng & hệ thống", icon: Server },
  { id: "meetings", label: "Lịch họp", icon: CalendarDays },
  { id: "docs", label: "Tài liệu", icon: FolderOpen },
  { id: "members", label: "Nhân viên", icon: Contact },
];

export const ST_CLS: Record<string, string> = {
  "Mới": "bg-black border border-red-500/70 text-slate-200", "Đang xử lý": "bg-black border border-yellow-500/80 text-slate-200", "Hoàn thành": "bg-black border border-emerald-500/80 text-slate-200",
  "Khẩn cấp": "bg-black border border-red-500/70 text-slate-200", "Cao": "bg-black border border-orange-500/80 text-slate-200", "Trung bình": "bg-black border border-sky-500/80 text-slate-200", "Thấp": "bg-black border border-slate-600 text-slate-400",
  "Backlog": "bg-black border border-slate-600 text-slate-400", "Đang làm": "bg-black border border-sky-500/80 text-slate-200", "Review": "bg-black border border-purple-500/80 text-slate-200", "Xong": "bg-black border border-emerald-500/80 text-slate-200",
  "Hoạt động": "bg-black border border-emerald-500/80 text-slate-200", "Sự cố": "bg-black border border-red-500/70 text-slate-200", "Bảo trì": "bg-black border border-yellow-500/80 text-slate-200",
  "Chờ duyệt": "bg-black border border-yellow-500/80 text-slate-200", "Đã duyệt": "bg-black border border-emerald-500/80 text-slate-200", "Từ chối": "bg-black border border-red-500/70 text-slate-400",
  "Đang làm việc": "bg-black border border-emerald-500/80 text-slate-200", "Thử việc": "bg-black border border-sky-500/80 text-slate-200",
};
export const Badge = ({ s }: { s: string }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${ST_CLS[s] || "bg-black border border-slate-700 text-slate-300"}`}>{s}</span>
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
        <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-500">
          {head.map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i} className="hover:bg-white/5">
            {r.map((c, j) => <td key={j} className="px-3 py-2.5">{c}</td>)}</tr>))}</tbody>
      </table>
    </div>
  );
}

export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const dmy = (s: string) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}` : "—");
export const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
export const inpCls = "bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/60";
export const selCls = "bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs outline-none focus:border-white/60";

export const TICKET_ST = ["Mới", "Đang xử lý", "Hoàn thành"];
// Các cột kanban dự án — dot/line/cnt = màu accent riêng từng cột (giống kanban phòng Business)
export const PROJ_COLS = [
  { st: "Backlog", dot: "bg-slate-400", line: "bg-slate-400/40", cnt: "text-slate-400" },
  { st: "Đang làm", dot: "bg-sky-400", line: "bg-sky-400/40", cnt: "text-sky-400" },
  { st: "Review", dot: "bg-purple-400", line: "bg-purple-400/40", cnt: "text-purple-400" },
  { st: "Xong", dot: "bg-emerald-400", line: "bg-emerald-400/40", cnt: "text-emerald-400" },
];
export const SYS_ST = ["Hoạt động", "Sự cố", "Bảo trì"];
export const SYS_TYPES = ["Website", "Service", "Database", "Email"];
