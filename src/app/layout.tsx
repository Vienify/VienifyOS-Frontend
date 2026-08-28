import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/LogoutButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VienifyOS",
  description: "Hệ thống quản trị nội bộ Vienify",
  icons: { icon: "/Logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* chừa chỗ cho footer cố định ở đáy màn hình */}
        <div className="flex-1 flex flex-col pb-24 sm:pb-16">{children}</div>
        <Footer />
        <LogoutButton />
      </body>
    </html>
  );
}
