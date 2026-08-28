// Tab Nhân viên — lưới card: avatar tròn, tên, chức vụ, mã nhân viên
import { Profile } from "@/lib/auth";
import { Badge, Card } from "./shared";

export default function MembersTab({ members }: { members: Profile[] }) {
  return (
    <Card title={`Nhân viên phòng ban (${members.length})`}>
      <div className="grid gap-x-4 gap-y-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 py-4">
        {members.map((m) => (
          <div key={m.email} className="flex flex-col items-center text-center gap-1">
            <div className="relative mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.avatar} alt={m.name} className="w-44 h-44 rounded-full object-cover" />
              {m.role !== "employee" && (
                <span className="absolute top-1 right-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black shadow">
                  {m.role === "admin" ? "FOUNDER · CEO" : "LEADER"}
                </span>
              )}
            </div>
            <p className="font-semibold">{m.name}</p>
            <p className="text-sm text-slate-400">{m.position}</p>
            <p className="text-xs text-slate-500">{m.code}</p>
            <div className="mt-2"><Badge s={m.status} /></div>
          </div>
        ))}
      </div>
    </Card>
  );
}
