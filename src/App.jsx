import React, { useMemo, useState } from "react";

const PASSWORD = "PQH2026";

const fmtVND = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
};

const pct = (value) => `${Math.round((Number.isFinite(value) ? value : 0) * 100)}%`;
const div = (a, b) => (b ? a / b : 0);

const sampleProducts = [
  {
    id: 1,
    sku: "TEF-ROB-20",
    name: "Chảo đúc Tefal Robusto miệng rót 20cm",
    brand: "Tefal",
    category: "Chảo / nồi",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=900&auto=format&fit=crop",
    cost: 205000,
    retail: 319000,
    ctv: 285000,
    wholesale: 270000,
    tier1: 319000,
    tier2: 299000,
    tier3: 285000,
    tier4: 275000,
    tier5: "Liên hệ giá tốt",
    stock: 480,
    status: "Còn hàng",
    channel: "Page / Live / CTV",
    revenueTarget: 90000000,
    revenueDone: 54000000,
    qtyTarget: 300,
    qtySold: 169,
    gm: 0.36,
    note: "Hàng dễ bán, thương hiệu mạnh, phù hợp live và khách gia đình.",
    contentHint: "Chảo chắc tay, dùng hằng ngày, chống dính tốt, dễ vệ sinh.",
    liveHint: "Demo chiên trứng/áp chảo, nhấn mạnh độ dày và miệng rót tiện lợi.",
  },
  {
    id: 2,
    sku: "KAI-NH-28",
    name: "Nồi hấp Kaiyo inox 2 tầng 28cm",
    brand: "Kaiyo",
    category: "Đồ bếp",
    image: "https://images.unsplash.com/photo-1584990347449-a0992a8a99cd?q=80&w=900&auto=format&fit=crop",
    cost: 185000,
    retail: 319000,
    ctv: 285000,
    wholesale: 265000,
    tier1: 319000,
    tier2: 299000,
    tier3: 285000,
    tier4: 269000,
    tier5: "Liên hệ giá tốt",
    stock: 620,
    status: "Ưu tiên live",
    channel: "Livestream / Sỉ số lượng",
    revenueTarget: 120000000,
    revenueDone: 43000000,
    qtyTarget: 400,
    qtySold: 135,
    gm: 0.42,
    note: "Tồn kho lớn, nên đẩy combo và livestream.",
    contentHint: "Nồi hấp tiện cho gia đình, hấp bánh, rau củ, hải sản.",
    liveHint: "Show 2 tầng, nắp, độ dày inox, gợi ý món hấp healthy.",
  },
  {
    id: 3,
    sku: "OWL-GIAT-22",
    name: "Nước giặt xả Owell 3in1 2.2L",
    brand: "Owell",
    category: "Nước giặt / lau sàn",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=900&auto=format&fit=crop",
    cost: 33000,
    retail: 89000,
    ctv: 75000,
    wholesale: 69000,
    tier1: 89000,
    tier2: 79000,
    tier3: 72000,
    tier4: 69000,
    tier5: 65000,
    stock: 1800,
    status: "Tồn cao",
    channel: "CTV / Combo / Livestream",
    revenueTarget: 150000000,
    revenueDone: 61000000,
    qtyTarget: 1800,
    qtySold: 685,
    gm: 0.63,
    note: "Phù hợp bán combo, freeship theo thùng, đẩy CTV.",
    contentHint: "Hương thơm dễ chịu, giặt sạch, phù hợp gia đình dùng hằng ngày.",
    liveHint: "Bán theo combo 2/4/6 can, nhấn mạnh tiết kiệm chi phí.",
  },
  {
    id: 4,
    sku: "OWL-SAN-35",
    name: "Nước lau sàn Owell sả chanh 3.5L",
    brand: "Owell",
    category: "Nước giặt / lau sàn",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=900&auto=format&fit=crop",
    cost: 42000,
    retail: 99000,
    ctv: 85000,
    wholesale: 79000,
    tier1: 99000,
    tier2: 89000,
    tier3: 82000,
    tier4: 79000,
    tier5: 75000,
    stock: 950,
    status: "Còn hàng",
    channel: "Page / CTV / Combo",
    revenueTarget: 80000000,
    revenueDone: 59000000,
    qtyTarget: 800,
    qtySold: 596,
    gm: 0.58,
    note: "Dễ bán cùng nước giặt, phù hợp combo chăm nhà.",
    contentHint: "Sàn sạch, thơm nhẹ, phù hợp gia đình có trẻ nhỏ.",
    liveHint: "Gợi ý combo nước giặt + lau sàn, lợi ích tiết kiệm.",
  },
  {
    id: 5,
    sku: "MIS-BR-01",
    name: "Bàn chải điện Miso làm sạch sâu",
    brand: "Miso",
    category: "Đồ tiện ích gia đình",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=900&auto=format&fit=crop",
    cost: 119000,
    retail: 249000,
    ctv: 219000,
    wholesale: 199000,
    tier1: 249000,
    tier2: 229000,
    tier3: 215000,
    tier4: 205000,
    tier5: "Liên hệ giá tốt",
    stock: 320,
    status: "Còn hàng",
    channel: "Reels / Page / Live",
    revenueTarget: 70000000,
    revenueDone: 28000000,
    qtyTarget: 280,
    qtySold: 112,
    gm: 0.52,
    note: "Phù hợp video review 30 giây, dễ tạo nhu cầu.",
    contentHint: "Làm sạch răng kỹ hơn bàn chải thường, tiện dùng mỗi ngày.",
    liveHint: "Cầm trực tiếp, show đầu bàn chải, chế độ rung, hộp sản phẩm.",
  },
  {
    id: 6,
    sku: "ARB-KNIFE-SET",
    name: "Bộ dao bếp Arber cán chắc tay",
    brand: "Arber",
    category: "Hàng cao cấp",
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=900&auto=format&fit=crop",
    cost: 260000,
    retail: 499000,
    ctv: 459000,
    wholesale: 430000,
    tier1: 499000,
    tier2: 469000,
    tier3: 449000,
    tier4: 429000,
    tier5: "Liên hệ giá tốt",
    stock: 120,
    status: "Còn hàng",
    channel: "Page / Reels cao cấp",
    revenueTarget: 60000000,
    revenueDone: 51500000,
    qtyTarget: 120,
    qtySold: 103,
    gm: 0.48,
    note: "Sản phẩm nâng hình ảnh page, không nên phá giá sâu.",
    contentHint: "Bộ dao đẹp, chắc, hợp căn bếp chỉn chu.",
    liveHint: "Tập trung vào cảm giác cầm, chất liệu, độ sắc và hộp quà.",
  },
];

function getStatus(product) {
  const r = div(product.revenueDone, product.revenueTarget);
  const q = div(product.qtySold, product.qtyTarget);
  if (r >= 1 || q >= 1) return { text: "Đạt KPI", cls: "ok" };
  if (r >= 0.75 || q >= 0.75) return { text: "Gần đạt", cls: "blue" };
  if (product.stock > 300 && r < 0.5) return { text: "Tồn cao - cần đẩy", cls: "warn" };
  if (r < 0.5) return { text: "Chậm tiến độ", cls: "bad" };
  return { text: "Đang bán ổn", cls: "normal" };
}

function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (password === PASSWORD) onLogin();
    else setError("Mật khẩu chưa đúng. Mật khẩu mẫu: PQH2026");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5 text-2xl">🔒</div>
        <h1 className="text-2xl font-black text-slate-950">PRICE HUB</h1>
        <p className="text-sm text-slate-500 mt-1">Phi Quốc Huy – Bảng tra giá sản phẩm</p>
        <label className="block mt-8 text-sm font-semibold text-slate-700">Mật khẩu truy cập</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-red-50 focus:border-red-400"
        />
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <button className="mt-6 w-full rounded-2xl bg-slate-950 text-white py-3 font-semibold hover:bg-red-700 transition">Vào hệ thống</button>
      </form>
    </div>
  );
}

function Stat({ title, value, sub, icon }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-black text-slate-950 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-xl">{icon}</div>
      </div>
    </div>
  );
}

function Dashboard({ products }) {
  const target = products.reduce((s, p) => s + p.revenueTarget, 0);
  const done = products.reduce((s, p) => s + p.revenueDone, 0);
  const stock = products.reduce((s, p) => s + p.stock, 0);
  const highStock = products.filter((p) => p.stock > 500).length;

  const rows = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const row = map.get(p.category) || { category: p.category, target: 0, done: 0, stock: 0, count: 0 };
      row.target += p.revenueTarget;
      row.done += p.revenueDone;
      row.stock += p.stock;
      row.count += 1;
      map.set(p.category, row);
    }
    return [...map.values()].sort((a, b) => div(b.done, b.target) - div(a.done, a.target));
  }, [products]);

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat title="Doanh số mục tiêu" value={fmtVND(target)} sub="Theo danh sách đang lọc" icon="📊" />
        <Stat title="Đã đạt" value={fmtVND(done)} sub={`${pct(div(done, target))} hoàn thành`} icon="📈" />
        <Stat title="Tổng tồn kho" value={stock.toLocaleString("vi-VN")} sub="Số lượng sản phẩm" icon="📦" />
        <Stat title="Cảnh báo tồn cao" value={highStock} sub="SKU cần đẩy Page/Live/CTV" icon="⚠️" />
      </div>
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">KPI doanh số theo danh mục</h2>
        <p className="text-sm text-slate-500 mb-4">Dùng để biết nhóm nào cần đẩy Page, Reel hoặc Livestream.</p>
        <div className="space-y-4">
          {rows.map((row) => {
            const rate = div(row.done, row.target);
            return (
              <div key={row.category}>
                <div className="flex justify-between text-sm mb-2 gap-3">
                  <b>{row.category}</b>
                  <span className="text-slate-500">{fmtVND(row.done)} / {fmtVND(row.target)} · {pct(rate)}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${Math.min(rate * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{row.count} SKU · Tồn kho {row.stock.toLocaleString("vi-VN")}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Tiers({ p }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="rounded-xl bg-slate-50 p-2"><span className="text-slate-500">1–5:</span> <b>{fmtVND(p.tier1)}</b></div>
      <div className="rounded-xl bg-slate-50 p-2"><span className="text-slate-500">6–20:</span> <b>{fmtVND(p.tier2)}</b></div>
      <div className="rounded-xl bg-slate-50 p-2"><span className="text-slate-500">21–50:</span> <b>{fmtVND(p.tier3)}</b></div>
      <div className="rounded-xl bg-slate-50 p-2"><span className="text-slate-500">51–100:</span> <b>{fmtVND(p.tier4)}</b></div>
      <div className="rounded-xl bg-red-50 text-red-700 p-2 col-span-2"><span>101+:</span> <b>{fmtVND(p.tier5)}</b></div>
    </div>
  );
}

function ProductCard({ p, onUpload, onPrint, onAI }) {
  const st = getStatus(p);
  const revenueRate = div(p.revenueDone, p.revenueTarget);
  const qtyRate = div(p.qtySold, p.qtyTarget);

  return (
    <article className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="relative h-44 bg-slate-100">
        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
        <label className="absolute bottom-3 right-3 cursor-pointer rounded-2xl bg-white/95 shadow px-3 py-2 text-xs font-semibold text-slate-700 flex items-center gap-1 hover:bg-red-50 no-print">
          🖼️ Đổi ảnh
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(p.id, e.target.files?.[0])} />
        </label>
      </div>
      <div className="p-5">
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-xs font-black text-red-600">{p.sku}</p>
            <h3 className="font-black text-slate-950 mt-1 leading-snug">{p.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{p.brand} · {p.category}</p>
          </div>
          <span className="h-fit rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{p.status}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Giá lẻ</p><p className="font-black">{fmtVND(p.retail)}</p></div>
          <div className="rounded-2xl bg-orange-50 p-3"><p className="text-xs text-orange-700">Giá CTV</p><p className="font-black text-orange-700">{fmtVND(p.ctv)}</p></div>
          <div className="rounded-2xl bg-red-50 p-3"><p className="text-xs text-red-700">Giá sỉ</p><p className="font-black text-red-700">{fmtVND(p.wholesale)}</p></div>
        </div>

        <p className="text-sm font-black text-slate-900 mt-4 mb-2">Giá số lượng</p>
        <Tiers p={p} />

        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div className="rounded-2xl border border-slate-100 p-3"><p className="text-xs text-slate-500">Tồn kho</p><p className="font-black">{p.stock.toLocaleString("vi-VN")}</p></div>
          <div className="rounded-2xl border border-slate-100 p-3"><p className="text-xs text-slate-500">GM%</p><p className="font-black">{pct(p.gm)}</p></div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-bold ${st.cls === "ok" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : st.cls === "blue" ? "bg-blue-50 text-blue-700 border-blue-200" : st.cls === "warn" ? "bg-orange-50 text-orange-700 border-orange-200" : st.cls === "bad" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}>{st.text}</span>
          <div className="mt-3 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Tiến độ doanh số</span><b>{pct(revenueRate)}</b></div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-950 rounded-full" style={{ width: `${Math.min(revenueRate * 100, 100)}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Tiến độ số lượng</span><b>{p.qtySold}/{p.qtyTarget}</b></div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-red-600 rounded-full" style={{ width: `${Math.min(qtyRate * 100, 100)}%` }} /></div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
          <p><b>Kênh bán:</b> {p.channel}</p>
          <p className="mt-1"><b>Ghi chú:</b> {p.note}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 no-print">
          <button onClick={() => onPrint(p)} className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50">🖨️ In</button>
          <button onClick={() => onPrint(p)} className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50">📄 PDF</button>
          <button onClick={() => onAI(p)} className="rounded-2xl bg-slate-950 text-white px-3 py-2 text-xs font-bold hover:bg-red-700">✨ AI</button>
        </div>
      </div>
    </article>
  );
}

function AIPanel({ product, onClose }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
  const [type, setType] = useState("Content Facebook Page");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!product) return null;

  const prompt = `Bạn là chuyên gia content bán hàng gia dụng tại Việt Nam. Hãy viết ${type} cho sản phẩm sau:

SKU: ${product.sku}
Tên sản phẩm: ${product.name}
Thương hiệu: ${product.brand}
Danh mục: ${product.category}
Giá lẻ: ${fmtVND(product.retail)}
Giá CTV: ${fmtVND(product.ctv)}
Giá sỉ: ${fmtVND(product.wholesale)}
Giá số lượng: 1-5 ${fmtVND(product.tier1)}, 6-20 ${fmtVND(product.tier2)}, 21-50 ${fmtVND(product.tier3)}, 51-100 ${fmtVND(product.tier4)}, 101+ ${fmtVND(product.tier5)}
Tồn kho: ${product.stock}
Điểm mạnh: ${product.contentHint}
Ghi chú live: ${product.liveHint}

Yêu cầu: tự nhiên, tinh tế, không lộ giọng AI, không giật tít rẻ tiền, có CTA inbox nhận báo giá.`;

  async function generate() {
    setError("");
    setResult("");
    if (!apiKey.trim()) return setError("Chị cần nhập Gemini API key để dùng thử AI.");
    localStorage.setItem("gemini_api_key", apiKey.trim());
    setLoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Không gọi được Gemini API.");
      setResult(data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI chưa trả nội dung.");
    } catch (e) {
      setError(e.message || "Có lỗi khi gọi AI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 no-print">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] overflow-auto">
        <div className="p-5 border-b border-slate-100 flex justify-between gap-3 sticky top-0 bg-white rounded-t-3xl">
          <div><p className="text-xs font-black text-red-600">AI CONTENT</p><h2 className="text-xl font-black">{product.name}</h2><p className="text-sm text-slate-500">Dùng Gemini API để viết content/review/kịch bản.</p></div>
          <button onClick={onClose} className="rounded-full border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50 h-fit">Đóng</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">MVP gọi Gemini trực tiếp từ frontend để test. Khi deploy thật, nên chuyển API key sang serverless function trên Vercel.</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-semibold">Gemini API key</label><input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Dán API key" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" /></div>
            <div><label className="text-sm font-semibold">Loại nội dung</label><select value={type} onChange={(e) => setType(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"><option>Content Facebook Page</option><option>Review sản phẩm 30 giây</option><option>Caption Reels</option><option>Kịch bản livestream</option><option>Mô tả sản phẩm</option><option>Tin nhắn tư vấn khách sỉ</option><option>Tin nhắn tư vấn CTV</option><option>Hook bán hàng</option></select></div>
          </div>
          <div><label className="text-sm font-semibold">Prompt gửi AI</label><textarea value={prompt} readOnly rows={8} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-slate-50" /></div>
          <div className="flex gap-2 flex-wrap"><button onClick={generate} disabled={loading} className="rounded-2xl bg-slate-950 text-white px-4 py-3 font-bold hover:bg-red-700 disabled:opacity-60">{loading ? "⏳ Đang viết..." : "✨ Viết bằng Gemini"}</button><button onClick={() => navigator.clipboard.writeText(result || prompt)} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold hover:bg-slate-50">📋 Copy</button></div>
          {error && <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}
          {result && <div><label className="text-sm font-semibold">Kết quả AI</label><textarea value={result} onChange={(e) => setResult(e.target.value)} rows={12} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" /></div>}
        </div>
      </div>
    </div>
  );
}

function PrintView({ product, products, mode, onClose }) {
  if (!mode) return null;
  const list = mode === "one" ? [product] : products;

  return (
    <div className="fixed inset-0 bg-white z-[60] overflow-auto print-area">
      <div className="max-w-5xl mx-auto p-8">
        <div className="no-print flex justify-between items-center mb-6">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 font-bold hover:bg-slate-50">Quay lại</button>
          <button onClick={() => window.print()} className="rounded-2xl bg-slate-950 text-white px-4 py-2 font-bold hover:bg-red-700">🖨️ In / Lưu PDF</button>
        </div>
        <div className="border-b-2 border-slate-950 pb-4 mb-6">
          <h1 className="text-3xl font-black text-slate-950">BÁO GIÁ SẢN PHẨM</h1>
          <p className="text-slate-600 mt-1">Công ty TNHH Phi Quốc Huy · 309 Quan Nhân, Thanh Xuân, Hà Nội</p>
          <p className="text-slate-600">Ngày xuất báo giá: {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
        <div className="space-y-6">
          {list.map((p) => (
            <div key={p.id} className="border border-slate-200 rounded-2xl p-4 break-inside-avoid">
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <img src={p.image} alt={p.name} className="w-28 h-28 object-cover rounded-2xl bg-slate-100" />
                <div>
                  <p className="text-sm font-black text-red-700">{p.sku}</p>
                  <h2 className="text-xl font-black text-slate-950">{p.name}</h2>
                  <p className="text-sm text-slate-600">{p.brand} · {p.category} · Tồn kho: {p.stock.toLocaleString("vi-VN")}</p>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm"><div><b>Giá lẻ:</b> {fmtVND(p.retail)}</div><div><b>Giá CTV:</b> {fmtVND(p.ctv)}</div><div><b>Giá sỉ:</b> {fmtVND(p.wholesale)}</div></div>
                  <div className="mt-2 text-sm"><b>Giá số lượng:</b> 1–5 {fmtVND(p.tier1)} · 6–20 {fmtVND(p.tier2)} · 21–50 {fmtVND(p.tier3)} · 51–100 {fmtVND(p.tier4)} · 101+ {fmtVND(p.tier5)}</div>
                  <p className="text-sm mt-2"><b>Ghi chú:</b> {p.note}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-4 border-t border-slate-200 text-sm text-slate-500">Báo giá có thể thay đổi theo tồn kho, chương trình ưu đãi và số lượng thực tế.</div>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("price_hub_login") === "1");
  const [products, setProducts] = useState(sampleProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [brand, setBrand] = useState("Tất cả");
  const [status, setStatus] = useState("Tất cả");
  const [aiProduct, setAiProduct] = useState(null);
  const [printMode, setPrintMode] = useState(null);
  const [printProduct, setPrintProduct] = useState(null);

  const categories = useMemo(() => ["Tất cả", ...new Set(products.map((p) => p.category))], [products]);
  const brands = useMemo(() => ["Tất cả", ...new Set(products.map((p) => p.brand))], [products]);
  const statuses = useMemo(() => ["Tất cả", ...new Set(products.map((p) => p.status))], [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const text = [p.sku, p.name, p.brand, p.category, p.note].join(" ").toLowerCase();
      return (!q || text.includes(q)) && (category === "Tất cả" || p.category === category) && (brand === "Tất cả" || p.brand === brand) && (status === "Tất cả" || p.status === status);
    });
  }, [products, query, category, brand, status]);

  function login() {
    localStorage.setItem("price_hub_login", "1");
    setLoggedIn(true);
  }

  function logout() {
    localStorage.removeItem("price_hub_login");
    setLoggedIn(false);
  }

  function uploadImage(id, file) {
    if (!file) return;
    const image = URL.createObjectURL(file);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, image } : p)));
  }

  if (!loggedIn) return <Login onLogin={login} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <style>{`@media print {.no-print{display:none!important}.print-area{position:static!important;inset:auto!important}.break-inside-avoid{break-inside:avoid;page-break-inside:avoid}}`}</style>
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-100 no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div><p className="text-xs font-black tracking-[0.25em] text-red-600">PRICE HUB</p><h1 className="text-xl md:text-2xl font-black text-slate-950">Bảng tra giá sản phẩm</h1><p className="text-sm text-slate-500">Phi Quốc Huy · B2B / B2C / CTV / Livestream</p></div>
          <div className="flex gap-2"><button onClick={() => setPrintMode("list")} className="hidden md:block rounded-2xl border border-slate-200 px-4 py-2 font-bold hover:bg-slate-50">🖨️ In/PDF</button><button onClick={logout} className="rounded-2xl bg-slate-950 text-white px-4 py-2 font-bold hover:bg-red-700">↩️ Thoát</button></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Dashboard products={filtered} />
        <section className="bg-white border border-slate-100 rounded-3xl p-4 md:p-5 shadow-sm no-print">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_180px] gap-3">
            <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo SKU, tên sản phẩm, thương hiệu, danh mục..." className="w-full rounded-2xl border border-slate-200 pl-12 pr-4 py-3 outline-none focus:ring-4 focus:ring-red-50 focus:border-red-400" /></div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3">{categories.map((x) => <option key={x}>{x}</option>)}</select>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3">{brands.map((x) => <option key={x}>{x}</option>)}</select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3">{statuses.map((x) => <option key={x}>{x}</option>)}</select>
          </div>
          <div className="mt-4 flex justify-between gap-3 text-sm text-slate-500"><p>Đang hiển thị <b className="text-slate-950">{filtered.length}</b> sản phẩm.</p><button onClick={() => setPrintMode("list")} className="md:hidden rounded-2xl border border-slate-200 px-4 py-2 font-bold">🖨️ In/PDF</button></div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => <ProductCard key={p.id} p={p} onUpload={uploadImage} onPrint={(x) => { setPrintProduct(x); setPrintMode("one"); }} onAI={setAiProduct} />)}
        </section>
        {filtered.length === 0 && <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center"><div className="text-5xl">📦</div><h3 className="text-lg font-black mt-4">Không tìm thấy sản phẩm</h3><p className="text-slate-500 mt-1">Chị thử đổi từ khóa hoặc bộ lọc.</p></div>}
      </main>

      <AIPanel product={aiProduct} onClose={() => setAiProduct(null)} />
      <PrintView product={printProduct} products={filtered} mode={printMode} onClose={() => { setPrintMode(null); setPrintProduct(null); }} />
    </div>
  );
}
