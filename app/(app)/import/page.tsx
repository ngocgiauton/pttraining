"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/format";

type Tab = "ton" | "congno" | "sanpham";

// Tách CSV đơn giản: hỗ trợ dấu phẩy, chấm phẩy hoặc tab (xuất từ MISA/Excel)
function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
      return line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    });
}

function toNum(s: string): number {
  const n = Number(String(s).replace(/[.\s]/g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

export default function ImportPage() {
  const supabase = useMemo(() => createClient(), []);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("ton");
  const [raw, setRaw] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<
    { cols: string[]; note?: string; level?: "ok" | "warn" | "err" }[]
  >([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("role")
      .single()
      .then(({ data }) => setIsAdmin(data?.role === "admin"));
  }, [supabase]);

  function reset() {
    setRaw("");
    setPreview([]);
    setChecked(false);
    setMsg(null);
  }

  // ---------- (a) TỒN KHO: SKU,Ton ----------
  async function checkTon() {
    setBusy(true);
    setMsg(null);
    const rows = parseCsv(raw).filter((r) => r[0]?.toLowerCase() !== "sku");
    const { data: prods } = await supabase.from("products").select("sku, ton");
    const map = new Map((prods || []).map((p) => [p.sku, p.ton]));
    setPreview(
      rows.map((r) => {
        const [sku, ton] = r;
        if (!map.has(sku))
          return {
            cols: [sku, ton],
            note: "Không tìm thấy SKU — sẽ bỏ qua",
            level: "err",
          };
        return {
          cols: [sku, ton],
          note: `Tồn hiện tại ${map.get(sku)} → ${toNum(ton)}`,
          level: "ok",
        };
      })
    );
    setChecked(true);
    setBusy(false);
  }

  async function applyTon() {
    setBusy(true);
    setMsg(null);
    const rows = parseCsv(raw).filter((r) => r[0]?.toLowerCase() !== "sku");
    let ok = 0,
      skip = 0;
    for (const [sku, ton] of rows) {
      const { data, error } = await supabase
        .from("products")
        .update({ ton: Math.round(toNum(ton)) })
        .eq("sku", sku)
        .select("id");
      if (!error && data && data.length > 0) ok++;
      else skip++;
    }
    setBusy(false);
    setMsg({
      type: "ok",
      text: `Đã cập nhật tồn kho ${ok} SKU${skip ? `, bỏ qua ${skip} dòng` : ""}.`,
    });
    setChecked(false);
  }

  // ---------- (b) CÔNG NỢ: MaKH,DuNo — chỉ đối chiếu, KHÔNG ghi đè ----------
  async function checkCongNo() {
    setBusy(true);
    setMsg(null);
    const rows = parseCsv(raw).filter(
      (r) => !["makh", "ma"].includes(r[0]?.toLowerCase())
    );
    const { data: kh } = await supabase
      .from("v_khach_hang")
      .select("ma, ten, du_no");
    const map = new Map((kh || []).map((k) => [k.ma, k]));
    setPreview(
      rows.map((r) => {
        const [ma, duNo] = r;
        const k = map.get(ma);
        if (!k)
          return {
            cols: [ma, formatMoney(toNum(duNo))],
            note: "Không có mã KH này trên web",
            level: "err",
          };
        const web = Number(k.du_no);
        const misa = toNum(duNo);
        const lech = misa - web;
        return {
          cols: [ma + " — " + k.ten, formatMoney(misa)],
          note:
            lech === 0
              ? `Khớp với web (${formatMoney(web)})`
              : `LỆCH ${formatMoney(lech)} (web: ${formatMoney(web)})`,
          level: lech === 0 ? "ok" : "warn",
        };
      })
    );
    setChecked(true);
    setBusy(false);
  }

  // ---------- (c) SẢN PHẨM MỚI ----------
  async function checkSanPham() {
    setBusy(true);
    setMsg(null);
    const rows = parseCsv(raw).filter((r) => r[0]?.toLowerCase() !== "sku");
    const { data: prods } = await supabase.from("products").select("sku");
    const existing = new Set((prods || []).map((p) => p.sku));
    setPreview(
      rows.map((r) => {
        if (r.length < 10)
          return {
            cols: r,
            note: "Thiếu cột (cần đủ 10 cột) — sẽ bỏ qua",
            level: "err",
          };
        if (!["A", "B", "C", "D"].includes(r[3]?.toUpperCase()))
          return { cols: r, note: "Nhóm phải là A/B/C/D — sẽ bỏ qua", level: "err" };
        return {
          cols: r,
          note: existing.has(r[0]) ? "Đã có — cập nhật" : "Mới — thêm",
          level: "ok",
        };
      })
    );
    setChecked(true);
    setBusy(false);
  }

  async function applySanPham() {
    setBusy(true);
    setMsg(null);
    const rows = parseCsv(raw).filter(
      (r) =>
        r[0]?.toLowerCase() !== "sku" &&
        r.length >= 10 &&
        ["A", "B", "C", "D"].includes(r[3]?.toUpperCase())
    );
    const payload = rows.map((r) => ({
      sku: r[0],
      ten: r[1],
      hang: r[2],
      nhom: r[3].toUpperCase(),
      gia_sll: toNum(r[4]),
      gia_si: toNum(r[5]),
      gia_ctv: toNum(r[6]),
      gia_von: toNum(r[7]),
      ton: Math.round(toNum(r[8])),
      ton_min: Math.round(toNum(r[9])),
      active: true,
    }));
    const { error } = await supabase
      .from("products")
      .upsert(payload, { onConflict: "sku" });
    setBusy(false);
    if (error) {
      setMsg({ type: "err", text: "Lỗi: " + error.message });
      return;
    }
    setMsg({ type: "ok", text: `Đã import ${payload.length} sản phẩm.` });
    setChecked(false);
  }

  if (isAdmin === null) return <p className="text-gray-400">Đang tải...</p>;
  if (!isAdmin)
    return (
      <p className="text-gray-500">
        Chỉ Giám đốc (admin) được dùng chức năng import.
      </p>
    );

  const tabInfo: Record<
    Tab,
    { label: string; placeholder: string; guide: string }
  > = {
    ton: {
      label: "Tồn kho",
      placeholder: "SKU,Ton\nTEF-CHAO28,95\nOWL-BINH1L,280",
      guide:
        "Dán 2 cột SKU,Ton xuất từ MISA. Hệ thống cập nhật lại số tồn trên web theo đúng số MISA.",
    },
    congno: {
      label: "Đối chiếu công nợ",
      placeholder: "MaKH,DuNo\nKH001,37000000\nKH002,12900000",
      guide:
        "Dán 2 cột MaKH,DuNo từ MISA. Hệ thống CHỈ đối chiếu và hiện chênh lệch với số trên web — không ghi đè tự động.",
    },
    sanpham: {
      label: "Sản phẩm mới",
      placeholder:
        "SKU,Ten,Hang,Nhom,GiaSLL,GiaSi,GiaCTV,GiaVon,Ton,TonMin\nTEF-XYZ,Chảo mới 26cm,Tefal,B,500000,540000,580000,400000,50,10",
      guide:
        "Dán đủ 10 cột: SKU,Ten,Hang,Nhom,GiaSLL,GiaSi,GiaCTV,GiaVon,Ton,TonMin. SKU đã có sẽ được cập nhật, SKU mới sẽ được thêm.",
    },
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-xl font-bold">Import từ MISA</h1>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(Object.keys(tabInfo) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              reset();
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              tab === t ? "bg-white shadow text-brand-700" : "text-gray-600"
            }`}
          >
            {tabInfo[t].label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-600">{tabInfo[tab].guide}</p>

      <textarea
        className="input font-mono text-xs !h-48"
        placeholder={tabInfo[tab].placeholder}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          setChecked(false);
        }}
      />

      <div className="flex gap-2">
        <button
          className="btn-secondary"
          disabled={busy || !raw.trim()}
          onClick={() =>
            tab === "ton"
              ? checkTon()
              : tab === "congno"
              ? checkCongNo()
              : checkSanPham()
          }
        >
          {busy ? "Đang kiểm tra..." : "Kiểm tra dữ liệu"}
        </button>
        {tab !== "congno" && (
          <button
            className="btn-primary"
            disabled={busy || !checked}
            onClick={() => (tab === "ton" ? applyTon() : applySanPham())}
            title={!checked ? "Bấm Kiểm tra dữ liệu trước" : ""}
          >
            {busy ? "Đang ghi..." : "Ghi vào hệ thống"}
          </button>
        )}
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

      {preview.length > 0 && (
        <div className="table-wrap">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Dữ liệu dán vào</th>
                <th className="th">Kết quả kiểm tra</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i}>
                  <td className="td font-mono text-xs max-w-[300px] whitespace-normal">
                    {r.cols.join(" · ")}
                  </td>
                  <td
                    className={`td text-sm ${
                      r.level === "err"
                        ? "text-red-600"
                        : r.level === "warn"
                        ? "text-amber-600 font-semibold"
                        : "text-emerald-600"
                    }`}
                  >
                    {r.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
