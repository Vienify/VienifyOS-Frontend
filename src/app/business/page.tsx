import Link from "next/link";
import DeptShell from "@/components/DeptShell";
import ProfileCard from "@/components/ProfileCard";
import HomeTabs from "@/components/HomeTabs";
import MyDeptLinks from "@/components/MyDeptLinks";
import ItSupport from "@/components/ItSupport";
import LeaveRequest from "@/components/LeaveRequest";

export default function BusinessPage() {
  return (
    <DeptShell slug="business" accent="bg-white">
      <ProfileCard />
      <div className="flex justify-center">
        <Link
          href="/business/workspace"
          className="px-8 py-3.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-semibold transition"
        >
          Vào phòng ban Business 
        </Link>
      </div>
      <MyDeptLinks current="business" />
      <HomeTabs items={[
        { label: "Hỗ trợ IT", el: <ItSupport /> },
        { label: "Nghỉ phép", el: <LeaveRequest /> },
      ]} />
    </DeptShell>
  );
}
