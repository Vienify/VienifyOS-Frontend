"use client";
// Cụm avatar + tên user ở header (dùng chung DeptShell + các workspace)
import { useEffect, useState } from "react";
import { API, getToken } from "@/lib/auth";

export default function UserChip() {
  const [u, setU] = useState<{ name: string; avatar: string } | null>(null);
  useEffect(() => {
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setU)
      .catch(() => {});
  }, []);
  return (
    <span className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-800">
      {u?.avatar ? (
        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover bg-white ring-1 ring-white/20" />
      ) : (
        <span className="w-7 h-7 rounded-full bg-white/10" />
      )}
      <span className="text-slate-200 font-medium">{u?.name}</span>
    </span>
  );
}
