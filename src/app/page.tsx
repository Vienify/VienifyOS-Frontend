import { redirect } from "next/navigation";

// Proxy sẽ điều hướng theo phòng ban; fallback về /login
export default function Home() {
  redirect("/login");
}
