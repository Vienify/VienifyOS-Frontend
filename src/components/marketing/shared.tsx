// Kiểu dữ liệu + hằng số + component UI dùng chung cho workspace Marketing
import { decodeToken } from "@/lib/auth";
import { CalendarDays, CalendarRange, Contact, FolderOpen, House, Megaphone, TrendingUp } from "lucide-react";

export type Campaign = { id: number; name: string; goal: string; channels: string[]; budget: number; spent: number; leads: number; reach: number; ownerId: number; ownerName?: string; status: string; start: string; end: string; note: string };
export type Content = { id: number; title: string; channel: string; date: string; campaignId: number | null; campaignName?: string | null; ownerId: number; ownerName?: string; status: string; note: string; body?: string; image?: string };
export type Meeting = { id: number; title: string; time: string; room: string; note?: string; status: string; createdBy: number; createdByName?: string; participantIds: number[]; participantNames?: string[]; depts: string[] };
export type Mkt = {
  channels: string[];
  campaigns: Campaign[];
  contents: Content[];
  meetings: Meeting[];
  kpi: { userId: number; name: string; target: number; achieved: number }[];
  monthTargets: Record<string, { dept: number; users: Record<string, number> }>;
  documents: { id: number; name: string; type: string; size: string; updated: string; hasFile?: boolean; byName?: string | null }[];
};

export type Me = ReturnType<typeof decodeToken>;
export type Api = (path: string, opts?: RequestInit) => Promise<Response>;
export type Notify = (msg: string, type?: "error" | "success") => void;
export type Put = (path: string, body: object, okMsg?: string) => Promise<void>;

export const MENU = [
  { id: "home", label: "Trang chủ", icon: House },
  { id: "campaigns", label: "Chiến dịch", icon: Megaphone },
  { id: "content", label: "Lịch nội dung", icon: CalendarRange },
  { id: "metrics", label: "Số liệu & KPI", icon: TrendingUp },
  { id: "meetings", label: "Lịch họp", icon: CalendarDays },
  { id: "docs", label: "Tài liệu", icon: FolderOpen },
  { id: "members", label: "Nhân viên", icon: Contact },
];

export const ST_CLS: Record<string, string> = {
  "Ý tưởng": "bg-black border border-slate-600 text-slate-400", "Chờ duyệt": "bg-black border border-yellow-500/80 text-slate-200",
  "Đang chạy": "bg-black border border-emerald-500/80 text-slate-200", "Kết thúc": "bg-black border border-sky-500/80 text-slate-200",
  "Từ chối": "bg-black border border-red-500/70 text-slate-400", "Viết": "bg-black border border-slate-600 text-slate-400",
  "Đã duyệt": "bg-black border border-purple-500/80 text-slate-200", "Đã đăng": "bg-black border border-emerald-500/80 text-slate-200",
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

export const money = (v: number) => `${(v * 1e6).toLocaleString("vi-VN")} VND`;
export const num = (v: number) => v.toLocaleString("vi-VN");
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const dmy = (s: string) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}` : "—");
export const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
export const inpCls = "bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/60";
export const selCls = "bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs outline-none focus:border-white/60";

// Các cột Kanban chiến dịch — dot/line/cnt = màu accent riêng từng cột (giống kanban khách hàng phòng Business)
export const CAMP_COLS = [
  { st: "Ý tưởng", label: "Ý tưởng", extra: ["Từ chối"], dot: "bg-slate-400", line: "bg-slate-400/40", cnt: "text-slate-400" },
  { st: "Chờ duyệt", label: "Chờ duyệt", extra: [] as string[], dot: "bg-yellow-400", line: "bg-yellow-400/40", cnt: "text-yellow-400" },
  { st: "Đang chạy", label: "Đang chạy", extra: [] as string[], dot: "bg-emerald-400", line: "bg-emerald-400/40", cnt: "text-emerald-400" },
  { st: "Kết thúc", label: "Kết thúc", extra: [] as string[], dot: "bg-sky-400", line: "bg-sky-400/40", cnt: "text-sky-400" },
];
export const CONT_CLR: Record<string, string> = {
  "Viết": "border-slate-600 bg-black text-slate-300",
  "Chờ duyệt": "border-yellow-500/80 bg-black text-yellow-300",
  "Đã duyệt": "border-purple-500/80 bg-black text-purple-300",
  "Đã đăng": "border-emerald-500/80 bg-black text-emerald-300",
};

// Thu nhỏ ảnh file về tối đa 1280px - data URL jpeg (giới hạn dung lượng gửi lên server)
export function fileToDataUrl(file: File, cb: (durl: string) => void) {
  const img = new Image();
  img.onload = () => {
    const sc = Math.min(1, 1280 / Math.max(img.width, img.height));
    const cv = document.createElement("canvas");
    cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
    cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
    cb(cv.toDataURL("image/jpeg", 0.85));
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(file);
}

export const monthKey = (off: number) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + off); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
export const monthLabel = (mkey: string) => `Tháng ${Number(mkey.slice(5))}/${mkey.slice(0, 4)}`;
