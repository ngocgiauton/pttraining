"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, parseMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function SanPhamPage() {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [q, setQ] = useState("");
  const [hang, setHang] = useState("");
  const [chiThieu, setChiThieu] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: prods }, { data: prof }] = await Promise.all([
      supabase.from("products").select("*").order("sku"),
      supabase.from("profiles").select("role").single(),
    ]);
    setProducts((prods as Product[]) || []);
    setIsAdmin(prof?.role === "admin");
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hangs = useMemo(
    () => Array.from(new Set(products.map((p) => p.hang))).sort(),
    [products]
  );

  const filtered = products.filter((p) => {
    if (hang && p.hang !== hang) return false;
    if (chiThieu && p.ton >= p.ton_min) return false;
    if (q) {
      const s = (p.sku + " " + p.ten).toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setMsg("");
    const { error } = await supabase
      .from("products")
      .update({
        ten: editing.ten,
        hang: editing.hang,
        nhom: editing.nhom,
        gia_sll: editing.gia_sll,
        gia_si: editing.gia_si,
        gia_ctv: editing.gia_ctv,
        gia_von: editing.gia_von,
        ton: editing.ton,
        ton_min: editing.ton_min,
        active: editing.active,
      })
      .eq("id", editing.id);
    setSaving(false);
    if (error) {
      setMsg("Lỗi: " + error.message);
      return;
    }
    setEditing(null);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-xl font-bold">Sản phẩm ({filtered.length})</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            className="input !w-56"
            placeholder="Tìm SKU hoặc tên..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="input !w-40"
            value={hang}
            onChange={(e) => setHang(e.target.value)}
          >
            <option value="">Tất cả hãng</option>
            {hangs.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={chiThieu}
              onChange={(e) => setChiThieu(e.target.checked)}
            />
            Dưới tồn min
          </label>
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
              <th className="th">SKU</th>
              <th className="th">Tên sản phẩm</th>
              <th className="th">Hãng</th>
              <th className="th">Nhóm</th>
              <th className="th text-right">Giá SLL</th>
              <th className="th text-right">Giá Sỉ</th>
              <th className="th text-right">Giá CTV</th>
              {isAdmin && <th className="th text-right">Giá vốn</th>}
              <th className="th text-right">Tồn</th>
              {isAdmin && <th className="th"></th>}
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
              filtered.map((p) => (
                <tr key={p.id} className={!p.active ? "opacity-40" : ""}>
                  <td className="td font-mono text-xs">{p.sku}</td>
                  <td className="td max-w-[240px] whitespace-normal">
                    {p.ten}
                    {!p.active && (
                      <span className="badge bg-gray-100 text-gray-500 ml-1">
                        ngừng bán
                      </span>
                    )}
                  </td>
                  <td className="td">{p.hang}</td>
                  <td className="td">
                    <span
                      className={`badge ${
                        p.nhom === "A"
                          ? "bg-emerald-100 text-emerald-700"
                          : p.nhom === "B"
                          ? "bg-blue-100 text-blue-700"
                          : p.nhom === "C"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.nhom}
                    </span>
                  </td>
                  <td className="td text-right">{formatMoney(p.gia_sll)}</td>
                  <td className="td text-right">{formatMoney(p.gia_si)}</td>
                  <td className="td text-right">{formatMoney(p.gia_ctv)}</td>
                  {isAdmin && (
                    <td className="td text-right text-gray-500">
                      {formatMoney(p.gia_von)}
                    </td>
                  )}
                  <td className="td text-right">
                    <span
                      className={
                        p.ton < p.ton_min
                          ? "badge bg-red-100 text-red-700 font-bold"
                          : ""
                      }
                    >
                      {p.ton}
                      {p.ton < p.ton_min && ` / min ${p.ton_min}`}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="td">
                      <button
                        className="text-brand-600 text-sm hover:underline"
                        onClick={() => setEditing({ ...p })}
                      >
                        Sửa
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="td text-gray-400" colSpan={10}>
                  Không có sản phẩm phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Hộp thoại sửa (chỉ admin) */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4">
          <form
            onSubmit={saveEdit}
            className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl p-5 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="font-semibold text-lg">
              Sửa sản phẩm — {editing.sku}
            </h2>
            <div>
              <label className="text-sm font-medium">Tên</label>
              <input
                className="input mt-1"
                value={editing.ten}
                onChange={(e) => setEditing({ ...editing, ten: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Hãng</label>
                <input
                  className="input mt-1"
                  value={editing.hang}
                  onChange={(e) =>
                    setEditing({ ...editing, hang: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nhóm (biên LN)</label>
                <select
                  className="input mt-1"
                  value={editing.nhom}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      nhom: e.target.value as Product["nhom"],
                    })
                  }
                >
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                  <option>D</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["gia_sll", "Giá SLL"],
                  ["gia_si", "Giá Sỉ"],
                  ["gia_ctv", "Giá CTV"],
                  ["gia_von", "Giá vốn"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <input
                    className="input mt-1 text-right"
                    inputMode="numeric"
                    value={formatMoney(editing[key])}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        [key]: parseMoney(e.target.value),
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Tồn kho</label>
                <input
                  className="input mt-1 text-right"
                  inputMode="numeric"
                  value={editing.ton}
                  onChange={(e) =>
                    setEditing({ ...editing, ton: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tồn tối thiểu</label>
                <input
                  className="input mt-1 text-right"
                  inputMode="numeric"
                  value={editing.ton_min}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      ton_min: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) =>
                  setEditing({ ...editing, active: e.target.checked })
                }
              />
              Đang kinh doanh
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditing(null)}
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
