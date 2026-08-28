import { NextRequest, NextResponse } from "next/server";
import { decodeToken, deptHome, DEPARTMENTS } from "@/lib/auth";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const user = decodeToken(req.cookies.get("vienify_token")?.value);

  // Chưa đăng nhập - chỉ được vào /login
  if (!user) {
    return pathname === "/login"
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", req.url));
  }

  // Đã đăng nhập mà vào /login hoặc / - về phòng của mình
  if (pathname === "/login" || pathname === "/")
    return NextResponse.redirect(new URL(deptHome(user), req.url));

  // Chặn truy cập phòng ban khác (admin được vào tất cả, hỗ trợ kiêm nhiệm nhiều phòng)
  const slug = pathname.split("/")[1];
  if (DEPARTMENTS[slug] && user.role !== "admin" && !(user.departments || [user.department]).includes(slug))
    return NextResponse.redirect(new URL(deptHome(user), req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
