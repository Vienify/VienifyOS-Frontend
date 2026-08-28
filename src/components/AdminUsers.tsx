"use client";
import { useEffect, useState } from "react";
import { API, DEPARTMENTS, decodeToken, getToken } from "@/lib/auth";
import DeptTag from "@/components/DeptTag";

type U = { id: number; name: string; email: string; code: string; avatar: string; department: string; departments?: string[]; role: string; position: string; dob: string; gender: string; phone: string; address: string; joinDate: string; status: string };
type Form = { id?: number; name: string; email: string; password: string; role: string; department: string; extraDepts: string[]; position: string; dob: string; gender: string; phone: string; address: string; joinDate: string; status: string };

const ROLE_LABEL: Record<string, string> = { admin: "Admin", manager: "Leader", employee: "Nhân viên" };
const ROLE_CLS: Record<string, string> = {
  admin: "bg-white text-black", manager: "bg-white/20 text-white", employee: "bg-white/5 text-slate-400",
};
const ST_CLS: Record<string, string> = {
  "Đang làm việc": "bg-black border border-emerald-500/80 text-slate-200", "Thử việc": "bg-black border border-sky-500/80 text-slate-200", "Đã nghỉ": "bg-black border border-slate-600 text-slate-400",
};
const EMP_ST = ["Đang làm việc", "Thử việc", "Đã nghỉ"];
const inpCls = "w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-white/60 transition";

// Ô nhập liệu có nhãn phía trên
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-xs text-slate-500 mb-1.5">{label}</span>
    {children}
  </label>
);
const emptyForm: Form = { name: "", email: "", password: "", role: "employee", department: "business", extraDepts: [], position: "", dob: "", gender: "Nam", phone: "", address: "", joinDate: "", status: "Thử việc" };

// Quản trị nhân sự toàn công ty — chỉ admin (phòng Tổng Cục)
export default function AdminUsers() {
  const [list, setList] = useState<U[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [confirmDel, setConfirmDel] = useState<U | null>(null);
  const [notice, setNotice] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const notify = (msg: string, type: "error" | "success" = "error") => setNotice({ type, msg });

  const me = decodeToken(getToken());
  const api = (path: string, opts: RequestInit = {}) =>
    fetch(`${API}${path}`, { ...opts, headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } });
  const reload = () => api("/api/admin/users").then((r) => r.json()).then((d) => Array.isArray(d) && setList(d));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, []);

  async function submit() {
    if (!form) return;
    if (!form.name.trim()) return notify("Nhập họ tên nhân viên");
    if (!form.email.trim()) return notify("Nhập email đăng nhập");
    const isEdit = !!form.id;
    const body: Record<string, unknown> = { ...form, departments: [form.department, ...form.extraDepts.filter((d) => d !== form.department)] };
    delete body.extraDepts;
    if (isEdit) { body.newPassword = form.password || undefined; delete body.password; }
    const r = await api(isEdit ? `/api/admin/users/${form.id}` : "/api/admin/users",
      { method: isEdit ? "PUT" : "POST", body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) return notify(d.message || "Lỗi");
    notify(isEdit ? `Đã cập nhật hồ sơ ${d.name}` : `Đã tạo tài khoản ${d.email} — Mã NV: ${d.code}`, "success");
    setForm(null); reload();
  }

  async function del(u: U) {
    const r = await api(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) return notify(d.message || "Lỗi");
    notify(`Đã xoá nhân viên ${u.name}`, "success");
    reload();
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold tracking-tight">Quản trị nhân sự</h2>
        <button onClick={() => setForm(form ? null : { ...emptyForm })}
          className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold transition">
          {form ? "Đóng form" : "Thêm nhân viên"}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-5">{list.length} nhân viên toàn công ty</p>

      {form && (
        <div className="mb-8 rounded-2xl border border-neutral-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800">
            <p className="font-bold">{form.id ? `Sửa hồ sơ — ${form.name}` : "Thêm nhân viên mới"}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {form.id ? "Cập nhật thông tin, quyền và phòng ban — mã NV tự cập nhật theo phòng/quyền" : "Mã NV tự sinh: VIE + phòng + EMP/LD + năm tháng + số thứ tự"}
            </p>
          </div>

          <div className="px-6 py-5 space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-3">Tài khoản đăng nhập</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Họ tên *">
                  <input className={inpCls} placeholder="Nguyễn Văn A" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Email đăng nhập *">
                  <input className={inpCls} placeholder="ten@vienify.com" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label={form.id ? "Đặt lại mật khẩu (bỏ trống = giữ nguyên)" : "Mật khẩu (bỏ trống = 123456)"}>
                  <input className={inpCls} type="password" placeholder="••••••"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </Field>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-3">Quyền & phòng ban</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Quyền hệ thống">
                  <select className={inpCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Phòng ban chính">
                  <select className={inpCls} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value, extraDepts: form.extraDepts.filter((d) => d !== e.target.value) })}>
                    {Object.entries(DEPARTMENTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Chức vụ (bỏ trống = theo quyền)">
                  <input className={inpCls} placeholder="VD: Chuyên viên kinh doanh" value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })} />
                </Field>
              </div>
              <div className="mt-4">
                <span className="block text-xs text-slate-500 mb-1.5">Kiêm nhiệm thêm (tối đa 2 phòng)</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DEPARTMENTS).filter(([k]) => k !== form.department).map(([k, l]) => {
                    const on = form.extraDepts.includes(k);
                    const full = !on && form.extraDepts.length >= 2;
                    return (
                      <button key={k} type="button" disabled={full}
                        onClick={() => setForm({ ...form, extraDepts: on ? form.extraDepts.filter((d) => d !== k) : [...form.extraDepts, k] })}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                          on ? "bg-white text-black border-white"
                            : full ? "border-neutral-800 text-slate-600 cursor-not-allowed"
                            : "border-neutral-700 text-slate-300 hover:bg-white/10"
                        }`}>
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-3">Thông tin cá nhân & công việc</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Ngày sinh">
                  <input type="date" className={inpCls} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                </Field>
                <Field label="Giới tính">
                  <select className={inpCls} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option>Nam</option><option>Nữ</option>
                  </select>
                </Field>
                <Field label="Số điện thoại">
                  <input className={inpCls} placeholder="09xxxxxxxx" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
                <Field label="Địa chỉ">
                  <input className={inpCls} placeholder="Quận, Thành phố" value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </Field>
                <Field label="Ngày vào làm">
                  <input type="date" className={inpCls} value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
                </Field>
                <Field label="Trạng thái">
                  <select className={inpCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {EMP_ST.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-neutral-800 flex justify-end gap-2">
            <button onClick={() => setForm(null)}
              className="px-4 py-2 rounded-lg border border-neutral-700 text-slate-300 hover:bg-white/10 text-sm font-semibold transition">
              Huỷ
            </button>
            <button onClick={submit} className="px-5 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold transition">
              {form.id ? "Lưu thay đổi" : "Tạo nhân viên + cấp tài khoản"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-500">
            {["Nhân viên", "Mã NV", "Phòng ban", "Quyền", "Chức vụ", "Vào làm", "SĐT", "Trạng thái", ""].map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}
          </tr></thead>
          <tbody>
            {[...list].sort((a, b) => a.department.localeCompare(b.department) || a.id - b.id).map((u) => (
              <tr key={u.id} className="hover:bg-white/5 transition">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="font-medium">{u.name}{u.id === me?.id && <span className="ml-1.5 text-[10px] text-slate-400">(bạn)</span>}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs">{u.code}</td>
                <td className="px-3 py-2.5">
                  <span className="flex flex-wrap gap-1">
                    {(u.departments?.length ? u.departments : [u.department]).map((d) => <DeptTag key={d} dept={d} />)}
                  </span>
                </td>
                <td className="px-3 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${ROLE_CLS[u.role]}`}>{ROLE_LABEL[u.role]}</span></td>
                <td className="px-3 py-2.5">{u.position}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">{u.joinDate || "—"}</td>
                <td className="px-3 py-2.5">{u.phone}</td>
                <td className="px-3 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${ST_CLS[u.status] || "bg-black border border-slate-700 text-slate-300"}`}>{u.status}</span></td>
                <td className="px-3 py-2.5">
                  <span className="flex gap-1.5">
                    <button onClick={() => setForm({ id: u.id, name: u.name, email: u.email, password: "", role: u.role, department: u.department, extraDepts: (u.departments || []).filter((d) => d !== u.department), position: u.position, dob: u.dob, gender: u.gender, phone: u.phone, address: u.address, joinDate: u.joinDate, status: u.status })}
                      aria-label="Sửa" title="Sửa"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.862 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    {u.id !== me?.id && (
                      <button onClick={() => setConfirmDel(u)}
                        aria-label="Xoá" title="Xoá"
                        className="p-1.5 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L5.772 5.79m13.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal xác nhận xoá */}
      {confirmDel && (
        <div className="fixed inset-0 z-[60] bg-black/60 grid place-items-center p-6" onClick={() => setConfirmDel(null)}>
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold">Xoá nhân viên</p>
            <p className="text-sm text-slate-300">Xoá <b>{confirmDel.name}</b> ({confirmDel.code} · {DEPARTMENTS[confirmDel.department]})? Tài khoản đăng nhập sẽ bị vô hiệu ngay lập tức.</p>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800" onClick={() => setConfirmDel(null)}>Huỷ</button>
              <button className="px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-500 text-sm font-semibold"
                onClick={() => { const u = confirmDel; setConfirmDel(null); del(u); }}>Xoá nhân viên</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo */}
      {notice && (
        <div className="fixed inset-0 z-[70] bg-black/60 grid place-items-center p-6" onClick={() => setNotice(null)}>
          <div className={`bg-neutral-900 border rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl ${notice.type === "error" ? "border-red-500/50" : "border-white/25"}`}
            onClick={(e) => e.stopPropagation()}>
            <p className={`text-sm font-semibold ${notice.type === "error" ? "text-red-300" : "text-white"}`}>
              {notice.type === "error" ? "Có lỗi xảy ra" : "Thành công"}
            </p>
            <p className="text-sm text-slate-200">{notice.msg}</p>
            <button className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-semibold" onClick={() => setNotice(null)}>Đóng</button>
          </div>
        </div>
      )}
    </section>
  );
}
