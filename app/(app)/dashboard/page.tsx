import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, currentMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const thang = currentMonth();
  const start = `${thang}-01`;
  const d = new Date(start + "T00:00:00");
  d.setMonth(d.getMonth() + 1);
  const end = d.toISOString().slice(0, 10);

  const [
    { data: payments },
    { data: khach },
    { data: products },
    { data: xepHang },
    { count: choDuyet },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("so_tien")
      .gte("ngay_thu", start)
      .lt("ngay_thu", end),
    supabase.from("v_khach_hang").select("du_no, no_qua_han, khoa_don"),
    supabase
      .from("products")
      .select("id, ton, ton_min")
      .eq("active", true),
    supabase.rpc("xep_hang_sale", { p_thang: thang }),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("trang_thai", "cho_duyet"),
    supabase.from("profiles").select("role").single(),
  ]);

  const thucThu = (payments || []).reduce((s, p) => s + Number(p.so_tien), 0);
  const tongDuNo = (khach || []).reduce((s, k) => s + Number(k.du_no), 0);
  const noQuaHan = (khach || []).reduce((s, k) => s + Number(k.no_qua_han), 0);
  const khachKhoa = (khach || []).filter((k) => k.khoa_don).length;
  const skuThieu = (products || []).filter((p) => p.ton < p.ton_min).length;
  const isAdmin = profile?.role === "admin";

  const cards = [
    { label: "Thực thu tháng này", value: formatMoney(thucThu) + " đ", color: "text-emerald-600" },
    { label: "Tổng dư nợ", value: formatMoney(tongDuNo) + " đ", color: "text-gray-900" },
    { label: "Nợ quá hạn", value: formatMoney(noQuaHan) + " đ", color: noQuaHan > 0 ? "text-red-600" : "text-gray-900" },
    { label: "Khách bị khóa đơn", value: String(khachKhoa), color: khachKhoa > 0 ? "text-red-600" : "text-gray-900", href: "/khach-hang" },
    { label: "SKU dưới tồn tối thiểu", value: String(skuThieu), color: skuThieu > 0 ? "text-amber-600" : "text-gray-900", href: "/san-pham" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Tổng quan tháng {thang.split("-")[1]}/{thang.split("-")[0]}
        </h1>
        {isAdmin && (choDuyet || 0) > 0 && (
          <Link
            href="/giao-dich?tab=cho-duyet"
            className="btn-danger !py-1.5 text-xs"
          >
            {choDuyet} đơn chờ duyệt →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => {
          const inner = (
            <div className="card p-4 h-full">
              <div className="text-xs text-gray-500">{c.label}</div>
              <div className={`mt-1 text-lg md:text-xl font-bold ${c.color}`}>
                {c.value}
              </div>
            </div>
          );
          return c.href ? (
            <Link key={c.label} href={c.href}>
              {inner}
            </Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Bảng xếp hạng sale tháng này</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">#</th>
                <th className="th">Nhân viên</th>
                <th className="th text-right">Thực thu (đ)</th>
                <th className="th text-right">Doanh thu (đ)</th>
              </tr>
            </thead>
            <tbody>
              {(xepHang || []).map(
                (
                  r: { ho_ten: string; thuc_thu: number; doanh_thu: number },
                  i: number
                ) => (
                  <tr key={r.ho_ten}>
                    <td className="td">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="td font-medium">{r.ho_ten}</td>
                    <td className="td text-right">{formatMoney(r.thuc_thu)}</td>
                    <td className="td text-right text-gray-500">
                      {formatMoney(r.doanh_thu)}
                    </td>
                  </tr>
                )
              )}
              {(!xepHang || xepHang.length === 0) && (
                <tr>
                  <td className="td text-gray-400" colSpan={4}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
