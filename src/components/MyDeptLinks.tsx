"use client";
// Nút truy cập các phòng ban kiêm nhiệm khác (hiện khi user thuộc 2-3 phòng)
import Link from "next/link";
import { useEffect, useState } from "react";
import { API, DEPARTMENTS, getToken } from "@/lib/auth";

export default function MyDeptLinks({ current }: { current: string }) {
  const [depts, setDepts] = useState<string[]>([]);
  useEffect(() => {
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u) return;
        const all: string[] = u.departments?.length ? u.departments : [u.department];
        setDepts(all.filter((d) => d !== current && DEPARTMENTS[d]));
      })
      .catch(() => {});
  }, [current]);
  if (!depts.length) return null;
  return (
    <div className="flex justify-center items-center gap-3 flex-wrap">
      <span className="text-sm text-slate-500">Phòng ban kiêm nhiệm:</span>
      {depts.map((d) => (
        <Link key={d} href={`/${d}`}
          className="px-6 py-2.5 rounded-xl border border-neutral-700 text-slate-200 hover:bg-white/10 font-semibold transition">
          {DEPARTMENTS[d]}
        </Link>
      ))}
    </div>
  );
}
