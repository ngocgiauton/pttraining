"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, LOAI_KHACH, NO_CHUAN } from "@/lib/format";
import type { KhachHang, Profile } from "@/lib/types";

export default function KhachHangPage() {
  const supabase = useMemo(() => createClient(), []);
  const [khach, setKhach] = useState<KhachHang[]>([]);
  const [sales, setSales] = useState<Profile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myId, setMyId] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    ma: "",
    ten: "",
    loai: "MOI",
    sale_id: "",
    ds_tb_3thang: 0,
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: kh }, { data: profs }, { data: userRes }] =
      await Promise.all([
        supabase.from("v_khach_hang").select("*").order("ma"),
        supabase.from("profiles").select("*").order("ho_ten"),
        supabase.auth.getUser().then((r) => ({ data: r.data.user })),
      ]);
    setKhach((kh as KhachHang[]) || []);
    setSales(((profs as Profile[]) || []).filter((p) => p.role === "sale"));
    const uid = userRes?.id || "";
    setMyId(uid);
    setIsAdmin(
      ((profs as Profile[]) || []).some(
        (p) => p.user_id === uid && p.role === "admin"
      )
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saleName = (id: string) =>
    sales.find((s) => s.user_id === id)?.ho_ten || "—";

  const filtered = khach.filter((k) => {
    if (!q) return true;
    return (k.ma + " " + k.ten).toLowerCase().includes(q.toLowerCase());
  });

  async function addKhach(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const { error } = await supabase.from("customers").insert({
      ma: form.ma.trim(),
      ten: form.ten.trim(),
      loai: form.loai,
      sale_id: isAdmin ? form.sale_id || myId : myId,
      ds_tb_3thang: isAdmin ? form.ds_tb_3thang : 0,
    });
    setSaving(false);
    if (error) {
      setMsg("Lỗi: " + error.message);
      return;
    }
    setShowAdd(false);
    setForm({ ma: "", ten: "", loai: "MOI", sale_id: "", ds_tb_3thang: 0 });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-xl font-bold">Khách hàng ({filtered.length})</h1>
        <div className="flex gap-2">
          <input
            className="input !w-56"
            placeholder="Tìm mã hoặc tên..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            + Thêm khách
          </button>
        </div>
      </div>

      {msg && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {msg}
        </div>
      )}

      <div className="table-wrap">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Mã</th>
              <th className="th">Tên khách hàng</th>
              <th className="th">Loại</th>
              {isAdmin && <th className="th">Sale phụ trách</th>}
              <th className="th text-right">DS TB 3 tháng</th>
              <th className="th text-right">Hạn mức</th>
              <th className="th text-right">Dư nợ</th>
              <th className="th text-right">Nợ quá hạn</th>
              <th className="th">Nợ chuẩn</th>
              <th className="th">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="td text-gray-400" colSpan={10}>
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((k) => (
                <tr key={k.id}>
                  <td className="td font-mono text-xs">{k.ma}</td>
                  <td className="td max-w-[220px] whitespace-normal font-medium">
                    {k.ten}
                  </td>
                  <td className="td">
                    <span className="badge bg-gray-100 text-gray-700">
                      {LOAI_KHACH[k.loai] || k.loai}
                    </span>
                  </td>
                  {isAdmin && <td className="td">{saleName(k.sale_id)}</td>}
                  <td className="td text-right text-gray-500">
                    {formatMoney(k.ds_tb_3thang)}
                  </td>
                  <td className="td text-right">{formatMoney(k.han_muc)}</td>
                  <td className="td text-right">{formatMoney(k.du_no)}</td>
                  <td
                    className={`td text-right ${
                      Number(k.no_qua_han) > 0 ? "text-red-600 font-semibold" : ""
                    }`}
                  >
                    {formatMoney(k.no_qua_han)}
                  </td>
                  <td className="td text-gray-500">
                    {NO_CHUAN[k.loai] > 0
                      ? `${NO_CHUAN[k.loai]} ngày`
                      : "Trả trước"}
                  </td>
                  <td className="td">
                    {k.khoa_don ? (
                      <span className="badge bg-red-100 text-red-700 font-bold">
                        KHÓA ĐƠN
                      </span>
                    ) : (
                      <span className="badge bg-emerald-100 text-emerald-700">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="td text-gray-400" colSpan={10}>
                  Chưa có khách hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Hạn mức tự tính theo quy chế: Sỉ = min(50% × DS TB, 100 triệu), nợ 15
        ngày · SLL = min(DS TB, 300 triệu), nợ 30 ngày · CTV/Mới trả trước.
        Khách bị KHÓA ĐƠN khi có nợ quá hạn trên 7 ngày.
      </p>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4">
          <form
            onSubmit={addKhach}
            className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 space-y-3"
          >
            <h2 className="font-semibold text-lg">Thêm khách hàng</h2>
            <div>
              <label className="text-sm font-medium">Mã khách (duy nhất)</label>
              <input
                className="input mt-1"
                value={form.ma}
                onChange={(e) => setForm({ ...form, ma: e.target.value })}
                placeholder="KH009"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tên khách hàng</label>
              <input
                className="input mt-1"
                value={form.ten}
                onChange={(e) => setForm({ ...form, ten: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Loại khách</label>
              <select
                className="input mt-1"
                value={form.loai}
                onChange={(e) => setForm({ ...form, loai: e.target.value })}
              >
                {Object.entries(LOAI_KHACH).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <>
                <div>
                  <label className="text-sm font-medium">Sale phụ trách</label>
                  <select
                    className="input mt-1"
                    value={form.sale_id}
                    onChange={(e) =>
                      setForm({ ...form, sale_id: e.target.value })
                    }
                    required
                  >
                    <option value="">— Chọn sale —</option>
                    {sales.map((s) => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.ho_ten}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Doanh số TB 3 tháng (đ)
                  </label>
                  <input
                    className="input mt-1 text-right"
                    inputMode="numeric"
                    value={formatMoney(form.ds_tb_3thang)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ds_tb_3thang:
                          Number(e.target.value.replace(/\D/g, "")) || 0,
                      })
                    }
                  />
                </div>
              </>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAdd(false)}
              >
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
