import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Kiểm tra người gọi là admin đang hoạt động
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("user_id", user.id)
    .single();
  if (!profile || profile.role !== "admin" || !profile.active) return null;
  return user;
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Tạo tài khoản mới (admin cấp — không cho tự đăng ký)
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chỉ Giám đốc được tạo tài khoản" },
      { status: 403 }
    );
  }
  const svc = serviceClient();
  if (!svc) {
    return NextResponse.json(
      { error: "Server chưa cấu hình SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { email, password, ho_ten, role } = body || {};
  if (!email || !password || !ho_ten) {
    return NextResponse.json(
      { error: "Thiếu email / mật khẩu / họ tên" },
      { status: 400 }
    );
  }
  if (String(password).length < 8) {
    return NextResponse.json(
      { error: "Mật khẩu phải từ 8 ký tự" },
      { status: 400 }
    );
  }

  const { data, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { ho_ten, role: role === "admin" ? "admin" : "sale" },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, user_id: data.user?.id });
}

// Khóa / mở khóa tài khoản
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chỉ Giám đốc được thao tác tài khoản" },
      { status: 403 }
    );
  }
  const svc = serviceClient();
  if (!svc) {
    return NextResponse.json(
      { error: "Server chưa cấu hình SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { user_id, action, new_password } = body || {};
  if (!user_id) {
    return NextResponse.json({ error: "Thiếu user_id" }, { status: 400 });
  }
  if (user_id === admin.id && action === "lock") {
    return NextResponse.json(
      { error: "Không thể tự khóa tài khoản của chính mình" },
      { status: 400 }
    );
  }

  if (action === "lock" || action === "unlock") {
    // Khóa đăng nhập ở tầng Auth + tắt active trong profiles
    const { error: e1 } = await svc.auth.admin.updateUserById(user_id, {
      ban_duration: action === "lock" ? "876000h" : "none",
    });
    if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });
    const { error: e2 } = await svc
      .from("profiles")
      .update({ active: action === "unlock" })
      .eq("user_id", user_id);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === "reset_password") {
    if (!new_password || String(new_password).length < 8) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải từ 8 ký tự" },
        { status: 400 }
      );
    }
    const { error } = await svc.auth.admin.updateUserById(user_id, {
      password: new_password,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
}
