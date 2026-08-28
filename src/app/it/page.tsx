import Link from "next/link";
import DeptShell from "@/components/DeptShell";
import ProfileCard from "@/components/ProfileCard";
import HomeTabs from "@/components/HomeTabs";
import MyDeptLinks from "@/components/MyDeptLinks";
import LeaveRequest from "@/components/LeaveRequest";

export default function ITPage() {
  return (
    <DeptShell slug="it" accent="bg-white">
      <ProfileCard />
      <div className="flex justify-center">
        <Link
          href="/it/workspace"
          className="px-8 py-3.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-semibold transition"
        >
          Vào phòng ban IT 
        </Link>
      </div>
      <MyDeptLinks current="it" />
      <HomeTabs items={[
        { label: "Nghỉ phép", el: <LeaveRequest /> },
      ]} />
    </DeptShell>
  );
}
