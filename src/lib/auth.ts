export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const DEPARTMENTS: Record<string, string> = {
  "tong-cuc": "Phòng Giám Đốc",
  business: "Phòng Business",
  marketing: "Phòng Marketing",
  it: "Phòng IT & Phát triển sản phẩm",
  hr: "Phòng Nhân Sự",
};

export type User = { id: number; name: string; email: string; role: string; department: string; departments?: string[] };

export type Profile = User & {
  code: string; avatar: string; dob: string; gender: string; phone: string; address: string;
  position: string; joinDate: string; status: string;
  departmentName: string; leader: string; access: string;
};

// Trang chủ theo user: admin về tổng cục, còn lại về phòng của mình
export const deptHome = (u: { role: string; department: string }) =>
  u.role === "admin" ? "/tong-cuc" : `/${u.department}`;

// Decode payload JWT (không verify — verify thật nằm ở backend)
export function decodeToken(token?: string): (User & { exp: number }) | null {
  if (!token) return null;
  try {
    // base64url - base64, rồi decode đúng UTF-8 (atob trả Latin-1 làm hỏng tiếng Việt)
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const p = JSON.parse(new TextDecoder().decode(bytes));
    // Token phải đúng cấu trúc của VienifyOS (tránh token của app khác trên localhost)
    return p.exp * 1000 > Date.now() && p.department ? p : null;
  } catch {
    return null;
  }
}

export const getToken = () =>
  typeof document === "undefined"
    ? undefined
    : document.cookie.match(/(?:^|; )vienify_token=([^;]*)/)?.[1];

export function logout() {
  const t = getToken();
  // Báo backend để ghi thông báo đăng xuất (không chờ kết quả)
  if (t) {
    try { fetch(`${API}/api/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${t}` }, keepalive: true }); } catch {}
  }
  document.cookie = "vienify_token=; path=/; max-age=0";
  location.href = "/login";
}
