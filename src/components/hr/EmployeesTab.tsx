// Tab Hồ sơ nhân viên toàn công ty — bảng hồ sơ + form sửa (leader)
import { useState } from "react";
import DeptTag from "@/components/DeptTag";
import { Badge, Card, EMP_ST, Hr, Put, Table, inpCls } from "./shared";

export default function EmployeesTab({ hr, isLeader, put }: { hr: Hr; isLeader: boolean; put: Put }) {
  const [empForm, setEmpForm] = useState<{ id: number; name: string; position: string; phone: string; address: string; joinDate: string; status: string } | null>(null);

  return (
    <Card title={`Hồ sơ nhân viên toàn công ty (${hr.employees.length})`}>
      {empForm && (
        <div className="mb-6 p-4 rounded-xl border border-neutral-800 space-y-3">
          <p className="font-semibold text-sm">Sửa hồ sơ — {empForm.name}</p>
          <div className="flex flex-wrap gap-3">
            <input className={inpCls + " w-56"} placeholder="Chức vụ" value={empForm.position}
              onChange={(e) => setEmpForm({ ...empForm, position: e.target.value })} />
            <input className={inpCls + " w-40"} placeholder="SĐT" value={empForm.phone}
              onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })} />
            <input className={inpCls + " w-64"} placeholder="Địa chỉ" value={empForm.address}
              onChange={(e) => setEmpForm({ ...empForm, address: e.target.value })} />
            <label className="text-xs text-slate-400 flex items-center">Vào làm
              <input type="date" className={inpCls + " ml-2"} value={empForm.joinDate}
                onChange={(e) => setEmpForm({ ...empForm, joinDate: e.target.value })} />
            </label>
            <select className={inpCls} value={empForm.status} onChange={(e) => setEmpForm({ ...empForm, status: e.target.value })}>
              {EMP_ST.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={async () => { await put(`/api/hr/employees/${empForm.id}`, empForm, "Đã cập nhật hồ sơ"); setEmpForm(null); }}
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Lưu hồ sơ</button>
            <button onClick={() => setEmpForm(null)} className="px-4 py-2 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">Huỷ</button>
          </div>
        </div>
      )}
      <Table head={["Nhân viên", "Mã NV", "Phòng ban", "Chức vụ", "Vào làm", "SĐT", "Trạng thái", ""]}
        rows={[...hr.employees].sort((a, b) => a.department.localeCompare(b.department) || a.id - b.id).map((u) => [
          <div key="m" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
            <div>
              <p className="font-medium">{u.name}
                {u.role !== "employee" && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/15 text-white">{u.role === "admin" ? "ADMIN" : "LEADER"}</span>}
              </p>
              <p className="text-xs text-slate-500">{u.email}</p>
            </div>
          </div>,
          u.code, <DeptTag key="dp" dept={u.department} />, u.position, u.joinDate, u.phone,
          <Badge key="s" s={u.status} />,
          isLeader ? (
            <button key="e" onClick={() => setEmpForm({ id: u.id, name: u.name, position: u.position, phone: u.phone, address: u.address, joinDate: u.joinDate, status: u.status })}
              className="px-2 py-1 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-xs">Sửa</button>
          ) : <span key="e" />,
        ])} />
    </Card>
  );
}
