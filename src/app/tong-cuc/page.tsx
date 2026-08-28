import Link from "next/link";
import DeptShell from "@/components/DeptShell";
import ProfileCard from "@/components/ProfileCard";
import HomeTabs from "@/components/HomeTabs";
import AdminUsers from "@/components/AdminUsers";
import ItSupport from "@/components/ItSupport";
import LeaveRequest from "@/components/LeaveRequest";

const DEPTS = [
  { href: "/business/workspace", label: "Phòng Business" },
  { href: "/marketing/workspace", label: "Phòng Marketing" },
  { href: "/it/workspace", label: "Phòng IT" },
  { href: "/hr/workspace", label: "Phòng Nhân Sự" },
];

const TAB_ITEMS = [
  { label: "Quản trị nhân sự", el: <AdminUsers /> },
  { label: "Hỗ trợ IT", el: <ItSupport /> },
  { label: "Nghỉ phép", el: <LeaveRequest /> },
];

export default function TongCucPage() {
  return (
    <DeptShell slug="tong-cuc" accent="bg-white">
      <ProfileCard />
      <section>
        <h2 className="text-lg font-bold tracking-tight">Truy cập phòng ban</h2>
        <p className="text-sm text-slate-500 mb-5"></p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DEPTS.map((d) => (
            <Link key={d.href} href={d.href}
              className="px-6 py-5 rounded-2xl font-semibold text-center bg-white text-black hover:bg-neutral-200 transition hover:-translate-y-0.5">
              {d.label}
            </Link>
          ))}
        </div>
      </section>
      <HomeTabs items={TAB_ITEMS} />
    </DeptShell>
  );
}
