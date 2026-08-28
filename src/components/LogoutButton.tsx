"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, logout } from "@/lib/auth";

// Nút đăng xuất dạng icon, cố định ở góc phải dưới màn hình
export default function LogoutButton() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!!getToken());
  }, [pathname]);

  if (!show || pathname === "/login" || pathname === "/") return null;

  return (
    <button
      onClick={logout}
      title="Đăng xuất"
      aria-label="Đăng xuất"
      className="group fixed bottom-5 right-5 z-40 h-14 px-4 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center shadow-lg shadow-black/40 transition-all duration-200 hover:scale-110 origin-bottom-right"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-200 group-hover:max-w-[7rem] group-hover:ml-2.5">
        Đăng xuất
      </span>
    </button>
  );
}
