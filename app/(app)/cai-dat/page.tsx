"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, parseMoney } from "@/lib/format";
import type { Profile } from "@/lib/types";

export default function CaiDatPage() {
  const supabase = useMemo(() => createClient(), []);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tyLeHH, setTyLeHH] = useState<Record<string, number>>({
    A: 0.012,
    B: 0.008,
    C: 0.004,
    D: 0,
  });
  const [mucTieu, setMucTieu] = useState<Record<string, number>>({});
  const [luongCB, setLuongCB] = useState<Record<string, number>>({
    mac_dinh: 8000000,
  });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [busy, setBusy] = useState(false);

  // Form tạo tài khoản
  const [showAdd, setShowAdd] = useState(false);
  const [nu, setNu] = useState({
    email: "",
    password: "",
    ho_ten: "",
    role: "sale",
  });

  async function load() {
    const [{ data: prof }, { data: profs }, { data: settings }] =
      await Promise.all([
        supabase.from("profiles").select("role").single(),
        supabase.from("profiles").select("*").order("role").order("ho_ten"),
        supabase.from("settings").select("*"),
      ]);
    setIsAdmin(prof?.role === "admin");
    setProfiles((profs as Profile[]) || []);
    for (const s of settings || []) {
      if (s.key === "ty_le_hh") setTyLeHH(s.value);
      if (s.key === "muc_tieu_sale") setMucTieu(s.value);
      if (s.key === "luong_co_ban") setLuongCB(s.value);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveSetting(key: string, value: unknown) {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.from("settings").upsert({ key, value });
    setBusy(false);
    setMsg(
      error
        ? { type: "err", text: "Lỗi: " + error.message }
        : { type: "ok", text: "Đã lưu cài đặt." }
    );
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nu),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg({ type: "err", text: json.error || "Tạo tài khoản thất bại" });
      return;
    }
    setMsg({ type: "ok", text: `Đã tạo tài khoản ${nu.email}.` });
    setShowAdd(false);
    setNu({ email: "", password: "", ho_ten: "", role: "sale" });
    load();
  }

  async function toggleLock(p: Profile) {
    if (
      !confirm(
        p.active
          ? `Khóa tài khoản của ${p.ho_ten}? Người này sẽ không đăng nhập được nữa.`
          : `Mở khóa tài khoản của ${p.ho_ten}?`
      )
    )
      return;
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: p.user_id,
        action: p.active ? "lock" : "unlock",
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg({ type: "err", text: json.error || "Thao tác thất bại" });
      return;
    }
    setMsg({
      type: "ok",
      text: p.active ? `Đã khóa ${p.ho_ten}.` : `Đã mở khóa ${p.ho_ten}.`,
    });
    load();
  }

  async function resetPassword(p: Profile) {
    const pw = prompt(`Mật khẩu mới cho ${p.ho_ten} (tối thiểu 8 ký tự):`);
    if (!pw) return;
    setBusy(true);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: p.user_id,
        action: "reset_password",
        new_password: pw,
      }),
    });
    const json = await res.json();
    setBusy(false);
    setMsg(
      res.ok
        ? { type: "ok", text: `Đã đổi mật khẩu cho ${p.ho_ten}.` }
        : { type: "err", text: json.error || "Đổi mật khẩu thất bại" }
    );
  }

  if (isAdmin === null) return <p className="text-gray-400">Đang tải...</p>;
  if (!isAdmin)
    return (
      <p className="text-gray-500">Chỉ Giám đốc (admin) truy cập được trang này.</p>
    );

  const sales = profiles.filter((p) => p.role === "sale");

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-xl font-bold">Cài đặt hệ thống</h1>

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

      {/* Tỷ lệ hoa hồng nhóm */}
      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">Tỷ lệ hoa hồng theo nhóm hàng</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["A", "B", "C", "D"] as const).map((n) => (
            <div key={n}>
              <label className="text-sm font-medium">Nhóm {n} (%)</label>
              <input
                className="input mt-1 text-right"
                inputMode="decimal"
                value={(Number(tyLeHH[n] ?? 0) * 100).toString()}
                onChange={(e) =>
                  setTyLeHH({
                    ...tyLeHH,
                    [n]: (Number(e.target.value.replace(",", ".")) || 0) / 100,
                  })
                }
              />
            </div>
          ))}
        </div>
        <button
          className="btn-primary"
          disabled={busy}
          onClick={() => saveSetting("ty_le_hh", tyLeHH)}
        >
          Lưu tỷ lệ hoa hồng
        </button>
      </section>

      {/* Mục tiêu doanh thu từng sale */}
      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">Mục tiêu doanh thu tháng của sale (đ)</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {sales.map((s) => (
            <div key={s.user_id} className="flex items-center gap-2">
              <div className="w-40 text-sm truncate">{s.ho_ten}</div>
              <input
                className="input text-right"
                inputMode="numeric"
                value={formatMoney(mucTieu[s.user_id] ?? 0)}
                onChange={(e) =>
                  setMucTieu({
                    ...mucTieu,
                    [s.user_id]: parseMoney(e.target.value),
                  })
                }
              />
            </div>
          ))}
        </div>
        <button
          className="btn-primary"
          disabled={busy}
          onClick={() => saveSetting("muc_tieu_sale", mucTieu)}
        >
          Lưu mục tiêu
        </button>
      </section>

      {/* Lương cơ bản */}
      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">Lương cơ bản (đ/tháng)</h2>
        <div className="flex items-center gap-2 max-w-sm">
          <div className="w-40 text-sm">Mặc định toàn team</div>
          <input
            className="input text-right"
            inputMode="numeric"
            value={formatMoney(luongCB["mac_dinh"] ?? 0)}
            onChange={(e) =>
              setLuongCB({ ...luongCB, mac_dinh: parseMoney(e.target.value) })
            }
          />
        </div>
        <button
          className="btn-primary"
          disabled={busy}
          onClick={() => saveSetting("luong_co_ban", luongCB)}
        >
          Lưu lương cơ bản
        </button>
      </section>

      {/* Quản lý tài khoản */}
      <section className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Tài khoản nhân viên</h2>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            + Tạo tài khoản
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Họ tên</th>
                <th className="th">Vai trò</th>
                <th className="th">Trạng thái</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.user_id}>
                  <td className="td font-medium">{p.ho_ten}</td>
                  <td className="td">
                    {p.role === "admin" ? (
                      <span className="badge bg-purple-100 text-purple-700">
                        Giám đốc
                      </span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-700">
                        Sale
                      </span>
                    )}
                  </td>
                  <td className="td">
                    {p.active ? (
                      <span className="badge bg-emerald-100 text-emerald-700">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="badge bg-red-100 text-red-700">
                        Đã khóa
                      </span>
                    )}
                  </td>
                  <td className="td">
                    <div className="flex gap-3">
                      <button
                        className="text-brand-600 text-sm hover:underline"
                        onClick={() => resetPassword(p)}
                      >
                        Đổi mật khẩu
                      </button>
                      <button
                        className={`text-sm hover:underline ${
                          p.active ? "text-red-600" : "text-emerald-600"
                        }`}
                        onClick={() => toggleLock(p)}
                      >
                        {p.active ? "Khóa" : "Mở khóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4">
          <form
            onSubmit={createUser}
            className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-5 space-y-3"
          >
            <h2 className="font-semibold text-lg">Tạo tài khoản mới</h2>
            <div>
              <label className="text-sm font-medium">Họ tên</label>
              <input
                className="input mt-1"
                value={nu.ho_ten}
                onChange={(e) => setNu({ ...nu, ho_ten: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email đăng nhập</label>
              <input
                type="email"
                className="input mt-1"
                value={nu.email}
                onChange={(e) => setNu({ ...nu, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Mật khẩu (tối thiểu 8 ký tự)
              </label>
              <input
                type="text"
                className="input mt-1"
                value={nu.password}
                onChange={(e) => setNu({ ...nu, password: e.target.value })}
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Vai trò</label>
              <select
                className="input mt-1"
                value={nu.role}
                onChange={(e) => setNu({ ...nu, role: e.target.value })}
              >
                <option value="sale">Sale</option>
                <option value="admin">Giám đốc (admin)</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAdd(false)}
              >
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
