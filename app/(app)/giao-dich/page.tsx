"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, formatDate, LOAI_KHACH } from "@/lib/format";
import type { CongNoHD, KhachHang, Product } from "@/lib/types";

interface Line {
  product_id: number;
  so_luong: number;
}

interface PendingTxn {
  id: number;
  ngay: string;
  so_hd: string;
  customer_id: number;
  doanh_thu: number;
  nhom: string;
  trang_thai: string;
}

function GiaoDichContent() {
  const supabase = useMemo(() => createClient(), []);
  const params = useSearchParams();
  const [tab, setTab] = useState<"ds" | "tao" | "cho-duyet">(
    params.get("tab") === "cho-duyet" ? "cho-duyet" : "ds"
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [hds, setHds] = useState<CongNoHD[]>([]);
  const [pending, setPending] = useState<PendingTxn[]>([]);
  const [khach, setKhach] = useState<KhachHang[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  // Form tạo đơn
  const [customerId, setCustomerId] = useState<number | "">("");
  const [ngay, setNgay] = useState(new Date().toISOString().slice(0, 10));
  const [soHd, setSoHd] = useState("");
  const [lines, setLines] = useState<Line[]>([{ product_id: 0, so_luong: 1 }]);
  const [saving, setSaving] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  // Form thu tiền
  const [thuHd, setThuHd] = useState<CongNoHD | null>(null);
  const [thuNgay, setThuNgay] = useState(new Date().toISOString().slice(0, 10));
  const [thuTien, setThuTien] = useState("");

  async function load() {
    setLoading(true);
    const [
      { data: prof },
      { data: cn },
      { data: kh },
      { data: prods },
      { data: pd },
    ] = await Promise.all([
      supabase.from("profiles").select("role").single(),
      supabase
        .from("v_cong_no_hd")
        .select("*")
        .order("ngay", { ascending: false })
        .limit(300),
      supabase.from("v_khach_hang").select("*").order("ma"),
      supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("sku"),
      supabase
        .from("transactions")
        .select("id, ngay, so_hd, customer_id, doanh_thu, nhom, trang_thai")
        .eq("trang_thai", "cho_duyet")
        .order("created_at", { ascending: false }),
    ]);
    setIsAdmin(prof?.role === "admin");
    setHds((cn as CongNoHD[]) || []);
    setKhach((kh as KhachHang[]) || []);
    setProducts((prods as Product[]) || []);
    setPending((pd as PendingTxn[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const khSelected = khach.find((k) => k.id === customerId);

  function giaTheoKhach(p: Product): number {
    if (!khSelected) return 0;
    if (khSelected.loai === "SLL") return Number(p.gia_sll);
    if (khSelected.loai === "SI") return Number(p.gia_si);
    return Number(p.gia_ctv);
  }

  const tongDon = lines.reduce((s, l) => {
    const p = products.find((x) => x.id === l.product_id);
    return s + (p ? giaTheoKhach(p) * (l.so_luong || 0) : 0);
  }, 0);

  const khName = (id: number) => {
    const k = khach.find((x) => x.id === id);
    return k ? `${k.ma} — ${k.ten}` : `#${id}`;
  };

  async function submitDon(guiDuyet: boolean) {
    if (!customerId || !soHd.trim()) {
      setMsg({ type: "err", text: "Vui lòng chọn khách và nhập số hóa đơn" });
      return;
    }
    const items = lines.filter((l) => l.product_id && l.so_luong > 0);
    if (items.length === 0) {
      setMsg({ type: "err", text: "Đơn hàng chưa có sản phẩm" });
      return;
    }
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.rpc("tao_giao_dich", {
      p_customer_id: customerId,
      p_ngay: ngay,
      p_so_hd: soHd.trim(),
      p_items: items,
      p_gui_duyet: guiDuyet,
    });
    setSaving(false);
    if (error) {
      if (error.message.includes("KHOA_DON")) {
        setBlockReason(error.message.replace(/^.*KHOA_DON:\s*/, ""));
        return;
      }
      setMsg({ type: "err", text: "Lỗi: " + error.message });
      return;
    }
    setBlockReason("");
    setMsg({
      type: "ok",
      text: guiDuyet
        ? "Đã gửi đơn cho Giám đốc duyệt (chưa trừ tồn, chưa tính công nợ)."
        : "Đã tạo đơn thành công, tồn kho đã được trừ.",
    });
    setCustomerId("");
    setSoHd("");
    setLines([{ product_id: 0, so_luong: 1 }]);
    setTab("ds");
    load();
  }

  async function duyet(id: number, dongY: boolean) {
    setMsg(null);
    const { error } = await supabase.rpc("duyet_giao_dich", {
      p_transaction_id: id,
      p_dong_y: dongY,
    });
    if (error) {
      setMsg({ type: "err", text: "Lỗi: " + error.message });
      return;
    }
    setMsg({
      type: "ok",
      text: dongY ? "Đã duyệt đơn, tồn kho đã trừ." : "Đã từ chối đơn.",
    });
    load();
  }

  async function ghiThu(e: React.FormEvent) {
    e.preventDefault();
    if (!thuHd) return;
    const tien = Number(thuTien.replace(/\D/g, ""));
    setMsg(null);
    const { error } = await supabase.rpc("ghi_thu_tien", {
      p_transaction_id: thuHd.id,
      p_ngay_thu: thuNgay,
      p_so_tien: tien,
    });
    if (error) {
      setMsg({ type: "err", text: "Lỗi: " + error.message });
      return;
    }
    setThuHd(null);
    setThuTien("");
    setMsg({ type: "ok", text: "Đã ghi thu tiền." });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Giao dịch</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(
            [
              ["ds", "Danh sách"],
              ["tao", "+ Tạo đơn"],
              ...(isAdmin
                ? [["cho-duyet", `Chờ duyệt (${pending.length})`]]
                : []),
            ] as [string, string][]
          ).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setTab(v as typeof tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                tab === v ? "bg-white shadow text-brand-700" : "text-gray-600"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-lg px-3 py-2 text-sm border ${
            msg.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* ===== DANH SÁCH HÓA ĐƠN ===== */}
      {tab === "ds" && (
        <div className="table-wrap">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Ngày</th>
                <th className="th">Số HĐ</th>
                <th className="th">Khách hàng</th>
                <th className="th">Nhóm</th>
                <th className="th text-right">Doanh thu</th>
                <th className="th text-right">Đã thu</th>
                <th className="th text-right">Còn nợ</th>
                <th className="th">Hạn TT</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="td text-gray-400" colSpan={9}>
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading &&
                hds.map((h) => (
                  <tr key={h.id}>
                    <td className="td">{formatDate(h.ngay)}</td>
                    <td className="td font-mono text-xs">
                      {h.so_hd}
                      {h.duyet_gd && (
                        <span
                          className="badge bg-purple-100 text-purple-700 ml-1"
                          title="Đơn vượt hạn mức đã được Giám đốc duyệt"
                        >
                          GĐ duyệt
                        </span>
                      )}
                    </td>
                    <td className="td max-w-[200px] whitespace-normal">
                      {khName(h.customer_id)}
                    </td>
                    <td className="td">{h.nhom}</td>
                    <td className="td text-right">{formatMoney(h.doanh_thu)}</td>
                    <td className="td text-right text-emerald-600">
                      {formatMoney(h.da_thu)}
                    </td>
                    <td
                      className={`td text-right ${
                        Number(h.con_no) > 0 && h.so_ngay_qua_han > 0
                          ? "text-red-600 font-semibold"
                          : ""
                      }`}
                    >
                      {formatMoney(h.con_no)}
                    </td>
                    <td className="td">
                      {formatDate(h.han_tt)}
                      {Number(h.con_no) > 0 && h.so_ngay_qua_han > 0 && (
                        <span className="badge bg-red-100 text-red-700 ml-1">
                          trễ {h.so_ngay_qua_han} ngày
                        </span>
                      )}
                    </td>
                    <td className="td">
                      {Number(h.con_no) > 0 && (
                        <button
                          className="text-brand-600 text-sm hover:underline"
                          onClick={() => {
                            setThuHd(h);
                            setThuTien(formatMoney(h.con_no));
                            setThuNgay(new Date().toISOString().slice(0, 10));
                          }}
                        >
                          Thu tiền
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              {!loading && hds.length === 0 && (
                <tr>
                  <td className="td text-gray-400" colSpan={9}>
                    Chưa có giao dịch
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== TẠO ĐƠN ===== */}
      {tab === "tao" && (
        <div className="card p-4 space-y-4 max-w-3xl">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Khách hàng</label>
              <select
                className="input mt-1"
                value={customerId}
                onChange={(e) => {
                  setCustomerId(Number(e.target.value) || "");
                  setBlockReason("");
                }}
              >
                <option value="">— Chọn khách hàng —</option>
                {khach.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.ma} — {k.ten} ({LOAI_KHACH[k.loai]})
                    {k.khoa_don ? " 🔒 KHÓA ĐƠN" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày</label>
              <input
                type="date"
                className="input mt-1"
                value={ngay}
                onChange={(e) => setNgay(e.target.value)}
              />
            </div>
          </div>

          {khSelected && (
            <div
              className={`rounded-lg px-3 py-2 text-sm border ${
                khSelected.khoa_don
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-brand-50 border-brand-100 text-brand-700"
              }`}
            >
              Áp giá <b>{LOAI_KHACH[khSelected.loai]}</b> · Hạn mức{" "}
              <b>{formatMoney(khSelected.han_muc)} đ</b> · Dư nợ{" "}
              <b>{formatMoney(khSelected.du_no)} đ</b>
              {khSelected.khoa_don && (
                <b> · Khách đang bị KHÓA ĐƠN (nợ quá hạn trên 7 ngày)</b>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Số hóa đơn</label>
            <input
              className="input mt-1 max-w-xs"
              value={soHd}
              onChange={(e) => setSoHd(e.target.value)}
              placeholder="HD-2026-0001"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Sản phẩm (giá tự áp theo loại khách)
            </label>
            {lines.map((line, i) => {
              const p = products.find((x) => x.id === line.product_id);
              return (
                <div key={i} className="flex flex-wrap gap-2 items-center">
                  <select
                    className="input flex-1 min-w-[200px]"
                    value={line.product_id}
                    onChange={(e) => {
                      const next = [...lines];
                      next[i] = { ...line, product_id: Number(e.target.value) };
                      setLines(next);
                    }}
                  >
                    <option value={0}>— Chọn SKU —</option>
                    {products.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.sku} — {pr.ten} (tồn {pr.ton})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    className="input !w-20 text-right"
                    value={line.so_luong}
                    onChange={(e) => {
                      const next = [...lines];
                      next[i] = { ...line, so_luong: Number(e.target.value) };
                      setLines(next);
                    }}
                  />
                  <div className="w-32 text-right text-sm">
                    {p && khSelected
                      ? formatMoney(giaTheoKhach(p) * (line.so_luong || 0)) + " đ"
                      : "—"}
                  </div>
                  <button
                    type="button"
                    className="text-red-500 text-sm px-1"
                    onClick={() => setLines(lines.filter((_, j) => j !== i))}
                    title="Xóa dòng"
                  >
                    ✕
                  </button>
                  {p && line.so_luong > p.ton && (
                    <span className="badge bg-red-100 text-red-700 w-full">
                      Vượt tồn kho ({p.ton})
                    </span>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              className="btn-secondary !py-1.5 text-xs"
              onClick={() =>
                setLines([...lines, { product_id: 0, so_luong: 1 }])
              }
            >
              + Thêm dòng
            </button>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <div className="text-sm text-gray-600">
              Tổng đơn:{" "}
              <span className="text-lg font-bold text-gray-900">
                {formatMoney(tongDon)} đ
              </span>
            </div>
            <button
              className="btn-primary"
              disabled={saving}
              onClick={() => submitDon(false)}
            >
              {saving ? "Đang lưu..." : "Tạo đơn"}
            </button>
          </div>

          {blockReason && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-2">
              <p className="text-sm text-red-700">
                <b>Đơn bị chặn:</b> {blockReason}
              </p>
              <button
                className="btn-danger !py-1.5 text-sm"
                disabled={saving}
                onClick={() => submitDon(true)}
              >
                Gửi Giám đốc duyệt
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== CHỜ DUYỆT (ADMIN) ===== */}
      {tab === "cho-duyet" && isAdmin && (
        <div className="table-wrap">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Ngày</th>
                <th className="th">Số HĐ</th>
                <th className="th">Khách hàng</th>
                <th className="th text-right">Giá trị đơn</th>
                <th className="th">Hạn mức / Dư nợ</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((t) => {
                const k = khach.find((x) => x.id === t.customer_id);
                return (
                  <tr key={t.id}>
                    <td className="td">{formatDate(t.ngay)}</td>
                    <td className="td font-mono text-xs">{t.so_hd}</td>
                    <td className="td max-w-[200px] whitespace-normal">
                      {khName(t.customer_id)}
                    </td>
                    <td className="td text-right font-semibold">
                      {formatMoney(t.doanh_thu)}
                    </td>
                    <td className="td text-xs text-gray-500">
                      {k
                        ? `HM ${formatMoney(k.han_muc)} · Nợ ${formatMoney(
                            k.du_no
                          )}${k.khoa_don ? " · 🔒 quá hạn >7 ngày" : ""}`
                        : "—"}
                    </td>
                    <td className="td">
                      <div className="flex gap-2">
                        <button
                          className="btn-primary !py-1 text-xs"
                          onClick={() => duyet(t.id, true)}
                        >
                          Duyệt
                        </button>
                        <button
                          className="btn-secondary !py-1 text-xs"
                          onClick={() => duyet(t.id, false)}
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pending.length === 0 && (
                <tr>
                  <td className="td text-gray-400" colSpan={6}>
                    Không có đơn chờ duyệt
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== HỘP THOẠI THU TIỀN ===== */}
      {thuHd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4">
          <form
            onSubmit={ghiThu}
            className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 space-y-3"
          >
            <h2 className="font-semibold text-lg">
              Thu tiền — {thuHd.so_hd}
            </h2>
            <p className="text-sm text-gray-600">
              {khName(thuHd.customer_id)} · Còn nợ{" "}
              <b className="text-red-600">{formatMoney(thuHd.con_no)} đ</b>
            </p>
            <div>
              <label className="text-sm font-medium">Ngày thu</label>
              <input
                type="date"
                className="input mt-1"
                value={thuNgay}
                onChange={(e) => setThuNgay(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Số tiền thu (đ)</label>
              <input
                className="input mt-1 text-right"
                inputMode="numeric"
                value={thuTien}
                onChange={(e) =>
                  setThuTien(
                    formatMoney(Number(e.target.value.replace(/\D/g, "")))
                  )
                }
                required
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setThuHd(null)}
              >
                Hủy
              </button>
              <button type="submit" className="btn-primary">
                Ghi thu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function GiaoDichPage() {
  return (
    <Suspense>
      <GiaoDichContent />
    </Suspense>
  );
}
