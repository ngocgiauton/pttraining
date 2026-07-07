"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, currentMonth } from "@/lib/format";
import type { BangLuongRow } from "@/lib/types";

export default function LuongKpiPage() {
  const supabase = useMemo(() => createClient(), []);
  const [thang, setThang] = useState(currentMonth());
  const [rows, setRows] = useState<BangLuongRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load(t: string) {
    setLoading(true);
    setMsg("");
    const [{ data, error }, { data: prof }] = await Promise.all([
      supabase.rpc("bang_luong_thang", { p_thang: t }),
      supabase.from("profiles").select("role").single(),
    ]);
    if (error) setMsg("Lỗi: " + error.message);
    setRows((data as BangLuongRow[]) || []);
    setIsAdmin(prof?.role === "admin");
    setLoading(false);
  }

  useEffect(() => {
    load(thang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thang]);

  async function updateKyLuat(saleId: string, diem: number) {
    const { error } = await supabase
      .from("kpi_inputs")
      .upsert({ thang, sale_id: saleId, ky_luat: diem });
    if (error) {
      setMsg("Lỗi: " + error.message);
      return;
    }
    load(thang);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Lương & KPI</h1>
        <input
          type="month"
          className="input !w-44"
          value={thang}
          onChange={(e) => setThang(e.target.value)}
        />
      </div>

      {msg && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {msg}
        </div>
      )}

      {!isAdmin && (
        <p className="text-sm text-gray-500">
          Bạn chỉ xem được lương KPI của chính mình.
        </p>
      )}

      <div className="table-wrap">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Nhân viên</th>
              <th className="th text-right">Mục tiêu</th>
              <th className="th text-right">Doanh thu</th>
              <th className="th text-right">Thực thu</th>
              <th className="th text-right">HH dòng</th>
              <th className="th text-right">HS quy mô</th>
              <th className="th text-right">Hoa hồng</th>
              <th className="th text-right" title="Doanh thu/mục tiêu ×40, +5 nếu >120%">Đ1</th>
              <th className="th text-right" title="Nợ quá hạn so với thực thu">Đ2</th>
              <th className="th text-right" title="Khách mới có đơn đầu trong tháng">Đ3</th>
              <th className="th text-right" title="Tỷ trọng nhóm A">Đ4</th>
              <th className="th text-right" title="Kỷ luật (nhập tay 0-10)">Đ5</th>
              <th className="th text-right">KPI</th>
              <th className="th text-right">Thưởng KPI</th>
              <th className="th text-right">Lương CB</th>
              <th className="th text-right">TỔNG LƯƠNG</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="td text-gray-400" colSpan={16}>
                  Đang tính...
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.sale_id}>
                  <td className="td font-medium">
                    {r.ho_ten}
                    <div className="text-[11px] text-gray-400 font-normal">
                      {r.khach_moi} khách mới · nhóm A{" "}
                      {(Number(r.ty_trong_a) * 100).toFixed(0)}% · NQH{" "}
                      {formatMoney(r.no_qua_han)}
                    </div>
                  </td>
                  <td className="td text-right text-gray-500">
                    {formatMoney(r.muc_tieu)}
                  </td>
                  <td className="td text-right">{formatMoney(r.doanh_thu)}</td>
                  <td className="td text-right text-emerald-600 font-medium">
                    {formatMoney(r.thuc_thu)}
                  </td>
                  <td className="td text-right">{formatMoney(r.hh_dong)}</td>
                  <td className="td text-right">
                    ×{Number(r.he_so_quy_mo).toFixed(1)}
                  </td>
                  <td className="td text-right font-medium">
                    {formatMoney(r.hoa_hong)}
                  </td>
                  <td className="td text-right">{Number(r.d1).toFixed(1)}</td>
                  <td className="td text-right">{Number(r.d2)}</td>
                  <td className="td text-right">{Number(r.d3)}</td>
                  <td className="td text-right">{Number(r.d4)}</td>
                  <td className="td text-right">
                    {isAdmin ? (
                      <input
                        type="number"
                        min={0}
                        max={10}
                        className="input !w-16 !py-1 text-right"
                        defaultValue={Number(r.d5)}
                        onBlur={(e) => {
                          const v = Math.max(
                            0,
                            Math.min(10, Number(e.target.value) || 0)
                          );
                          if (v !== Number(r.d5)) updateKyLuat(r.sale_id, v);
                        }}
                      />
                    ) : (
                      Number(r.d5)
                    )}
                  </td>
                  <td
                    className={`td text-right font-bold ${
                      Number(r.kpi) < 50 ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {Number(r.kpi).toFixed(1)}
                  </td>
                  <td className="td text-right">{formatMoney(r.thuong_kpi)}</td>
                  <td className="td text-right text-gray-500">
                    {formatMoney(r.luong_co_ban)}
                  </td>
                  <td className="td text-right font-bold text-brand-700">
                    {formatMoney(r.tong_luong)}
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="td text-gray-400" colSpan={16}>
                  Không có dữ liệu tháng này
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card p-4 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-600">
          Cách tính (Quy chế 01/2026/QC-PQH):
        </p>
        <p>
          · Hoa hồng dòng = tiền thu × tỷ lệ nhóm (A 1,2% · B 0,8% · C 0,4% · D
          0%) × hệ số tuổi nợ (đúng hạn 100% · trễ ≤30 ngày 70% · ≤60 ngày 50%
          · &gt;60 ngày 0%).
        </p>
        <p>
          · Hoa hồng tháng = Σ HH dòng × hệ số quy mô theo tổng thực thu
          (&lt;100tr: 0 · ≥100tr: 1,0 · ≥500tr: 1,1 · ≥1 tỷ: 1,2 · ≥1,5 tỷ:
          1,3).
        </p>
        <p>
          · KPI 100 điểm: Đ1 doanh thu/mục tiêu ×40 (+5 nếu &gt;120%) · Đ2 nợ
          quá hạn &lt;5% thực thu = 25đ, 5–10% = 15đ, &gt;10% = 0đ · Đ3 khách
          mới ≥3 = 15đ, 2 = 10đ, 1 = 5đ · Đ4 tỷ trọng nhóm A ≥25% = 10đ, ≥15% =
          6đ · Đ5 kỷ luật 0–10 (admin nhập tay).
        </p>
        <p>· Thưởng KPI = 1.000.000 × điểm/100; dưới 50 điểm không thưởng.</p>
      </div>
    </div>
  );
}
