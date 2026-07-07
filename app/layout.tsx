import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PQH OPS — Quản lý bán hàng Phi Quốc Huy",
  description:
    "Hệ thống quản lý bán hàng nội bộ Công ty TNHH Phi Quốc Huy",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
