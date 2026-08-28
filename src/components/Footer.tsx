// Footer chung toàn hệ thống — luôn cố định ở đáy màn hình
export default function Footer() {
  return (
    <footer className="fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-black/95 backdrop-blur text-slate-400">
      <div className="mx-auto max-w-7xl px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-full bg-white flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="VienifyOS" className="h-6 w-6" />
          </span>
          <div>
            <p className="font-semibold text-slate-200 leading-tight">VienifyOS</p>
            <p className="text-[11px] leading-tight">Hệ thống quản trị nội bộ Vienify</p>
          </div>
        </div>
        <p className="text-xs">© {new Date().getFullYear()} Vienify. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  );
}
