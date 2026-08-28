// Kiểu dữ liệu + hằng số + component UI dùng chung cho workspace Nhân sự
import { decodeToken } from "@/lib/auth";
import { CalendarDays, CalendarOff, ClipboardList, Contact, FolderOpen, House, UserPlus } from "lucide-react";

export type Emp = { id: number; name: string; email: string; code: string; avatar: string; department: string; role: string; position: string; joinDate: string; phone: string; address: string; status: string };
export type Job = { id: number; title: string; dept: string; quantity: number; desc: string; status: string; at: string };
export type Cand = { id: number; name: string; jobId: number | null; jobTitle?: string | null; phone: string; email: string; note: string; stage: string; at: string };
export type Leave = { id: number; type: string; from: string; to: string; reason: string; dept: string; createdBy: number; createdByName?: string; status: string; note: string; decidedByName?: string | null; at: string };
export type Meeting = { id: number; title: string; time: string; room: string; note?: string; status: string; createdBy: number; createdByName?: string; participantIds: number[]; participantNames?: string[]; depts: string[] };
export type Hr = {
  employees: Emp[]; jobs: Job[]; candidates: Cand[]; leaves: Leave[]; meetings: Meeting[];
  documents: { id: number; name: string; type: string; size: string; updated: string; hasFile?: boolean; byName?: string | null }[];
};

export type Me = ReturnType<typeof decodeToken>;
export type Api = (path: string, opts?: RequestInit) => Promise<Response>;
export type Notify = (msg: string, type?: "error" | "success") => void;
export type Put = (path: string, body: object, okMsg?: string) => Promise<void>;
export type Post = (path: string, body: object, okMsg: string) => Promise<Response | void>;

export const MENU = [
  { id: "home", label: "Trang chủ", icon: House },
  { id: "leaves", label: "Nghỉ phép", icon: CalendarOff },
  { id: "recruit", label: "Tuyển dụng", icon: UserPlus },
  { id: "employees", label: "Hồ sơ nhân viên", icon: ClipboardList },
  { id: "meetings", label: "Lịch họp", icon: CalendarDays },
  { id: "docs", label: "Tài liệu", icon: FolderOpen },
  { id: "members", label: "Nhân viên", icon: Contact },
];

export const ST_CLS: Record<string, string> = {
  "Chờ duyệt": "bg-black border border-yellow-500/80 text-slate-200", "Đã duyệt": "bg-black border border-emerald-500/80 text-slate-200", "Từ chối": "bg-black border border-red-500/70 text-slate-400",
  "Đang tuyển": "bg-black border border-emerald-500/80 text-slate-200", "Tạm dừng": "bg-black border border-yellow-500/80 text-slate-200", "Đã đủ": "bg-black border border-slate-600 text-slate-400",
  "Mới": "bg-black border border-white/60 text-slate-200", "Phỏng vấn": "bg-black border border-sky-500/80 text-slate-200", "Offer": "bg-black border border-purple-500/80 text-slate-200",
  "Nhận việc": "bg-black border border-emerald-500/80 text-slate-200", "Loại": "bg-black border border-slate-600 text-slate-400",
  "Đang làm việc": "bg-black border border-emerald-500/80 text-slate-200", "Thử việc": "bg-black border border-sky-500/80 text-slate-200", "Đã nghỉ": "bg-black border border-slate-600 text-slate-400",
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

export const LEAVE_ST = ["Chờ duyệt", "Đã duyệt", "Từ chối"];
export const JOB_ST = ["Đang tuyển", "Tạm dừng", "Đã đủ"];
// Các cột kanban ứng viên — dot/line/cnt = màu accent riêng từng cột (giống kanban phòng Business)
export const CAND_COLS = [
  { st: "Mới", dot: "bg-slate-400", line: "bg-slate-400/40", cnt: "text-slate-400" },
  { st: "Phỏng vấn", dot: "bg-sky-400", line: "bg-sky-400/40", cnt: "text-sky-400" },
  { st: "Offer", dot: "bg-purple-400", line: "bg-purple-400/40", cnt: "text-purple-400" },
  { st: "Nhận việc", dot: "bg-emerald-400", line: "bg-emerald-400/40", cnt: "text-emerald-400" },
  { st: "Loại", dot: "bg-red-400", line: "bg-red-400/40", cnt: "text-red-400" },
];
export const EMP_ST = ["Đang làm việc", "Thử việc", "Đã nghỉ"];
