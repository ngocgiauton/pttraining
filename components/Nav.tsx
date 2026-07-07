"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MENU = [
  { href: "/dashboard", label: "Tổng quan", icon: "📊" },
  { href: "/san-pham", label: "Sản phẩm", icon: "📦" },
  { href: "/khach-hang", label: "Khách hàng", icon: "👥" },
  { href: "/giao-dich", label: "Giao dịch", icon: "🧾" },
  { href: "/luong-kpi", label: "Lương & KPI", icon: "💰" },
  { href: "/import", label: "Import MISA", icon: "📥", adminOnly: true },
  { href: "/cai-dat", label: "Cài đặt", icon: "⚙️", adminOnly: true },
];

export default function Nav({
  hoTen,
  role,
}: {
  hoTen: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = MENU.filter((m) => !m.adminOnly || role === "admin");

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Thanh trên cùng */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/dashboard" className="font-bold text-brand-700 text-lg shrink-0">
              PQH OPS
            </Link>
            {/* Menu ngang cho màn hình lớn */}
            <nav className="hidden md:flex items-center gap-1">
              {items.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    pathname.startsWith(m.href)
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {m.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium leading-tight">{hoTen}</div>
              <div className="text-xs text-gray-500 leading-tight">
                {role === "admin" ? "Giám đốc" : "Nhân viên sale"}
              </div>
            </div>
            <button
              onClick={logout}
              className="btn-secondary !px-3 !py-1.5 text-xs"
              title="Đăng xuất"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Menu dưới đáy cho điện thoại */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex">
        {items.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`flex-1 flex flex-col items-center py-2 text-[10px] ${
              pathname.startsWith(m.href)
                ? "text-brand-700 font-semibold"
                : "text-gray-500"
            }`}
          >
            <span className="text-lg leading-none">{m.icon}</span>
            <span className="mt-0.5">{m.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
