"use client";
import { useEffect, useState } from "react";
import { API, Profile, getToken } from "@/lib/auth";
import DeptTag from "@/components/DeptTag";

const ROLE_TAG: Record<string, { label: string; cls: string }> = {
  admin: { label: "FOUNDER · CEO", cls: "bg-white text-black border-black/20" },
  manager: { label: "LEADER", cls: "bg-black text-white border-white/60" },
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString("vi-VN");

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-200">{value}</span>
    </div>
  );
}

const inputCls =
  "bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-sm w-full outline-none focus:border-white/60";

export default function ProfileCard() {
  const [p, setP] = useState<Profile | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const headers = () => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" });

  useEffect(() => {
    fetch(`${API}/api/auth/me`, { headers: headers() }).then((r) => r.json()).then(setP);
  }, []);

  if (!p) return <section className="py-8 text-slate-400">Đang tải hồ sơ...</section>;
  const tag = ROLE_TAG[p.role];

  const startEdit = () => {
    setForm({ phone: p.phone, address: p.address });
    setEdit(true);
  };

  async function saveProfile() {
    const res = await fetch(`${API}/api/auth/me`, { method: "PUT", headers: headers(), body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) {
      setP((prev) => (prev ? { ...prev, ...data } : data));
      setEdit(false);
      setMsg({ ok: true, text: "Đã lưu thông tin" });
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.newPassword !== pw.confirm) return setMsg({ ok: false, text: "Xác nhận mật khẩu không khớp" });
    const res = await fetch(`${API}/api/auth/password`, { method: "PUT", headers: headers(), body: JSON.stringify(pw) });
    const data = await res.json();
    setMsg({ ok: res.ok, text: data.message });
    if (res.ok) {
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      setPwOpen(false);
    }
  }

  const F = (key: string, type = "text") => (
    <input type={type} className={inputCls} value={form[key] || ""}
      onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
  );

  function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const img = new Image();
    img.onload = async () => {
      const S = 256;
      const c = document.createElement("canvas");
      c.width = c.height = S;
      const m = Math.min(img.width, img.height);
      c.getContext("2d")!.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
      URL.revokeObjectURL(img.src);
      const avatar = c.toDataURL("image/jpeg", 0.85);
      const res = await fetch(`${API}/api/auth/me`, { method: "PUT", headers: headers(), body: JSON.stringify({ avatar }) });
      const data = await res.json();
      if (res.ok) { setP((prev) => (prev ? { ...prev, ...data } : data)); setMsg({ ok: true, text: "Đã đổi ảnh đại diện" }); }
      else setMsg({ ok: false, text: data.message || "Đổi ảnh thất bại" });
    };
    img.onerror = () => setMsg({ ok: false, text: "File không phải ảnh hợp lệ" });
    img.src = URL.createObjectURL(file);
  }

  return (
    <section>
      {/* Header hồ sơ */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <label className="relative group cursor-pointer" title="Bấm để đổi ảnh đại diện">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.avatar} alt={p.name} className="w-36 h-36 rounded-full object-cover ring-2 ring-neutral-700 ring-offset-2 ring-offset-black" />
            {tag && (
              <span className={`absolute top-0 -right-4 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${tag.cls}`}>
                {tag.label}
              </span>
            )}
            <span className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition grid place-items-center text-[11px] font-semibold text-white text-center leading-tight"><br />Đổi ảnh</span>
            <input type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
          </label>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{p.name}</h2>
            </div>
            <p className="text-slate-400 text-sm">{p.position} · {p.departmentName}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
              {p.status}
            </span>
          </div>
        </div>
        {edit ? (
          <div className="flex gap-2">
            <button onClick={saveProfile} className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Lưu</button>
            <button onClick={() => setEdit(false)} className="px-4 py-1.5 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">Huỷ</button>
          </div>
        ) : (
          <button onClick={startEdit} className="px-4 py-1.5 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">
            Chỉnh sửa
          </button>
        )}
      </div>

      {msg && <p className={`mb-4 text-sm ${msg.ok ? "text-white" : "text-red-400"}`}>{msg.text}</p>}

      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Thông tin cá nhân</h3>
          {edit ? (
            <div className="space-y-2 text-sm">
              <Row label="Họ tên" value={p.name} />
              <Row label="Ngày sinh" value={fmtDate(p.dob)} />
              <Row label="Giới tính" value={p.gender} />
              <label className="block text-slate-500 pt-1">SĐT {F("phone")}</label>
              <label className="block text-slate-500">Địa chỉ {F("address")}</label>
            </div>
          ) : (
            <>
              <Row label="Họ tên" value={p.name} />
              <Row label="Ngày sinh" value={fmtDate(p.dob)} />
              <Row label="Giới tính" value={p.gender} />
              <Row label="SĐT" value={p.phone} />
              <Row label="Email" value={p.email} />
              <Row label="Địa chỉ" value={p.address} />
            </>
          )}
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Thông tin công việc</h3>
          <Row label="Mã nhân viên" value={p.code} />
          <Row label="Chức vụ" value={p.position} />
          <Row label="Phòng ban" value={<DeptTag dept={p.department} />} />
          <Row label="Leader" value={p.leader} />
          <Row label="Ngày vào làm" value={fmtDate(p.joinDate)} />
          <Row label="Trạng thái" value={p.status} />
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Tài khoản</h3>
          <Row label="Email đăng nhập" value={p.email} />
          <Row label="Role" value={p.role} />
          <Row label="Quyền truy cập" value={p.access} />

          {pwOpen ? (
            <form onSubmit={changePassword} className="mt-4 space-y-2">
              <input type="password" placeholder="Mật khẩu hiện tại" className={inputCls} required
                value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
              <input type="password" placeholder="Mật khẩu mới (≥ 6 ký tự)" className={inputCls} required
                value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
              <input type="password" placeholder="Xác nhận mật khẩu mới" className={inputCls} required
                value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              <div className="flex gap-2 pt-1">
                <button className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-semibold">Xác nhận</button>
                <button type="button" onClick={() => setPwOpen(false)} className="px-4 py-1.5 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">Huỷ</button>
              </div>
            </form>
          ) : (
            <button onClick={() => { setPwOpen(true); setMsg(null); }}
              className="mt-4 w-full px-4 py-2 rounded-lg border border-neutral-700 text-sm text-slate-300 hover:bg-white/10">
              Đổi mật khẩu
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
