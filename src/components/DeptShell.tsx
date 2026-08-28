"use client";
import { DEPARTMENTS } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";
import UserChip from "@/components/UserChip";

// Khung chung: header sticky + container, nội dung riêng truyền qua children
export default function DeptShell({ slug, accent, children }: {
  slug: string; accent: string; children?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-black/80 backdrop-blur">
        <div className="w-[80%] mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${accent}`} />
            <h1 className="font-bold tracking-tight">{DEPARTMENTS[slug]}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <NotificationBell />
            <UserChip />
          </div>
        </div>
      </header>
      <div className="w-[80%] mx-auto py-10 space-y-14">{children}</div>
    </main>
  );
}
