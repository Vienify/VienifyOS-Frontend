// Tag phòng ban dùng chung toàn hệ thống: nền đen, chỉ viền khác màu theo từng phòng
import { DEPARTMENTS } from "@/lib/auth";

const BORDER: Record<string, string> = {
  "tong-cuc": "border-white/70",
  business: "border-emerald-500/80",
  marketing: "border-pink-500/80",
  it: "border-sky-500/80",
  hr: "border-amber-500/80",
};

export default function DeptTag({ dept }: { dept: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full bg-black border text-xs text-slate-200 whitespace-nowrap ${BORDER[dept] || "border-slate-600"}`}>
      {DEPARTMENTS[dept] || dept}
    </span>
  );
}
