"use client";
// Thanh tab dùng chung cho trang chủ các phòng: ấn tab nào hiển thị nội dung mục đó
import { useState } from "react";

export default function HomeTabs({ items }: { items: { label: string; el: React.ReactNode }[] }) {
  const [tab, setTab] = useState(0);
  return (
    <section>
      <div className="flex gap-2 mb-8 flex-wrap">
        {items.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === i ? "bg-white text-black" : "text-slate-400 hover:text-white hover:bg-white/10"
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      {items[tab].el}
    </section>
  );
}
