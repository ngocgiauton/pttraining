# HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH — PQH OPS

Web app quản lý bán hàng nội bộ của Công ty TNHH Phi Quốc Huy, thay thế Google Sheets. Chạy trên điện thoại và laptop, tiếng Việt 100%.

Công nghệ (đều dùng **gói miễn phí**):
- **Next.js 14** + Tailwind — giao diện, deploy trên **Vercel**
- **Supabase** — cơ sở dữ liệu PostgreSQL + đăng nhập + phân quyền RLS

---

## PHẦN 1 — TẠO TÀI KHOẢN SUPABASE (kho dữ liệu)

1. Vào <https://supabase.com> → **Start your project** → đăng ký bằng email hoặc GitHub (miễn phí).
2. Bấm **New project**:
   - **Name**: `pqh-ops`
   - **Database Password**: đặt mật khẩu mạnh, **ghi lại cẩn thận**
   - **Region**: chọn `Southeast Asia (Singapore)` cho nhanh
3. Đợi 1–2 phút để project khởi tạo.

### 1.1. Chạy schema (tạo bảng + phân quyền)

1. Trong project Supabase, mở menu trái → **SQL Editor** → **New query**.
2. Mở file `supabase/schema.sql` trong repo này, **copy toàn bộ** nội dung, dán vào và bấm **Run**.
   - Kết quả "Success. No rows returned" là đúng. Các dòng NOTICE "does not exist, skipping" là bình thường.
3. Tạo query mới, copy toàn bộ `supabase/seed.sql`, dán và **Run** — lệnh này tạo:
   - 1 tài khoản Giám đốc + 6 tài khoản sale (mật khẩu chung: **`PQH@2026`**)
     | Email | Vai trò |
     |---|---|
     | admin@pqh.vn | Giám đốc (admin) |
     | sale1@pqh.vn … sale6@pqh.vn | Sale |
   - 20 SKU mẫu (Tefal, O'well, Kaiyo, Zojirushi), 8 khách hàng, cấu hình hoa hồng/KPI, vài giao dịch demo (trong đó KH002 đang bị **KHÓA ĐƠN** để test).
   - ⚠️ Seed chỉ dùng để test. Khi chạy thật hãy đổi hết mật khẩu (trang **Cài đặt**) hoặc xóa user demo trong **Authentication → Users**.

### 1.2. Tắt tự đăng ký (bắt buộc)

Vào **Authentication → Sign In / Providers → Email**:
- **TẮT** "Allow new users to sign up" — chỉ Giám đốc tạo tài khoản từ trang Cài đặt.

### 1.3. Lấy khóa kết nối

Vào **Project Settings → API**, ghi lại 3 giá trị:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (**tuyệt mật** — chỉ dán vào biến môi trường server, không gửi qua chat/email)

---

## PHẦN 2 — CHẠY THỬ TRÊN MÁY (npm run dev)

Yêu cầu: cài [Node.js](https://nodejs.org) bản 18 trở lên.

```bash
# 1. Cài thư viện
npm install

# 2. Tạo file biến môi trường
cp .env.example .env.local
# Mở .env.local và điền 3 giá trị lấy ở bước 1.3

# 3. Chạy
npm run dev
```

Mở <http://localhost:3000> → đăng nhập bằng `admin@pqh.vn` / `PQH@2026`.

---

## PHẦN 3 — DEPLOY LÊN VERCEL (miễn phí)

1. Đưa code lên GitHub (repo private).
2. Vào <https://vercel.com> → đăng ký bằng tài khoản GitHub → **Add New → Project** → chọn repo này → **Import**.
3. Ở bước cấu hình, mở **Environment Variables** và thêm đủ 3 biến:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Bấm **Deploy**. Xong sẽ có địa chỉ dạng `https://pqh-ops.vercel.app` — gửi link này cho team, mở được trên điện thoại như app.
5. Về sau mỗi lần push code mới lên GitHub, Vercel tự deploy lại.

---

## PHẦN 4 — TẠO / KHÓA TÀI KHOẢN NHÂN VIÊN

Chỉ Giám đốc (role admin) làm được, ngay trên web:

1. Đăng nhập → menu **Cài đặt** → mục **Tài khoản nhân viên**.
2. **+ Tạo tài khoản** → nhập họ tên, email, mật khẩu (≥8 ký tự), chọn vai trò → **Tạo tài khoản**. Đưa email + mật khẩu cho nhân viên.
3. Nhân viên nghỉ việc → bấm **Khóa** (không đăng nhập được nữa, dữ liệu giao dịch vẫn giữ nguyên).
4. Quên mật khẩu → bấm **Đổi mật khẩu** và cấp mật khẩu mới.

Phân quyền:
- **Giám đốc (admin)**: thấy mọi thứ; duy nhất được sửa giá, hạn mức (qua DS TB 3 tháng), duyệt đơn vượt hạn mức, xem bảng lương toàn team, import MISA, tạo/khóa tài khoản.
- **Sale**: chỉ thấy khách hàng + giao dịch mình phụ trách; XEM được 3 mức giá nhưng không sửa; chỉ xem lương KPI của mình.
- Hệ thống **tự đăng xuất sau 12 giờ không hoạt động**.

---

## PHẦN 5 — QUY TRÌNH IMPORT MISA HÀNG NGÀY

Mỗi sáng, kế toán xuất số liệu từ MISA ra Excel, sau đó vào menu **Import MISA** (chỉ admin thấy):

### 5.1. Cập nhật tồn kho
1. Từ MISA xuất báo cáo tồn kho, giữ lại 2 cột **SKU, Ton**.
2. Copy 2 cột đó (Ctrl+C trong Excel) → dán vào tab **Tồn kho** → bấm **Kiểm tra dữ liệu** để xem trước → **Ghi vào hệ thống**.
3. SKU nào không có trên web sẽ được báo đỏ và bỏ qua.

### 5.2. Đối chiếu công nợ
1. Từ MISA xuất công nợ khách, giữ 2 cột **MaKH, DuNo**.
2. Dán vào tab **Đối chiếu công nợ** → **Kiểm tra dữ liệu**.
3. Hệ thống hiện từng dòng: **Khớp** (xanh) hay **LỆCH bao nhiêu** (vàng) so với số trên web. **Không ghi đè tự động** — nếu lệch, kiểm tra lại phiếu thu/hóa đơn còn thiếu rồi bổ sung bằng tay.

### 5.3. Nhập sản phẩm mới
1. Chuẩn bị đủ 10 cột: `SKU,Ten,Hang,Nhom,GiaSLL,GiaSi,GiaCTV,GiaVon,Ton,TonMin` (Nhom là A/B/C/D theo biên lợi nhuận).
2. Dán vào tab **Sản phẩm mới** → **Kiểm tra dữ liệu** → **Ghi vào hệ thống**. SKU đã tồn tại sẽ được cập nhật, SKU mới được thêm.

Mẹo: cả 3 loại đều nhận dữ liệu dán thẳng từ Excel (phân cách tab), có/không có dòng tiêu đề đều được.

---

## PHẦN 6 — QUY TẮC NGHIỆP VỤ HỆ THỐNG TỰ ÁP DỤNG (Quy chế 01/2026/QC-PQH)

1. **3 mức giá**: Giá SLL < Giá Sỉ < Giá CTV, hiện đủ ở mọi màn hình sản phẩm. Khi tạo đơn chỉ cần chọn khách — hệ thống tự áp giá theo loại khách, sale không gõ tay giá.
2. **Hạn mức tín dụng tự tính**: Sỉ = min(50% × DS TB 3 tháng, 100 triệu), nợ 15 ngày · SLL = min(DS TB, 300 triệu), nợ 30 ngày · CTV/Mới = 0 (trả trước).
3. **Chặn đơn**: khách có nợ quá hạn >7 ngày HOẶC (dư nợ + đơn mới) vượt hạn mức → không tạo được đơn; sale bấm **"Gửi Giám đốc duyệt"**, Giám đốc duyệt ở tab **Chờ duyệt** thì đơn mới được ghi (hệ thống log ai duyệt, lúc nào).
4. **Hoa hồng dòng** = tiền thu × tỷ lệ nhóm (A 1,2% · B 0,8% · C 0,4% · D 0%) × hệ số tuổi nợ (đúng hạn 100% · trễ ≤30 ngày 70% · ≤60 ngày 50% · >60 ngày 0%).
5. **Hoa hồng tháng** = Σ hoa hồng dòng (theo ngày thu trong tháng) × hệ số quy mô theo tổng thực thu (<100tr: 0 · ≥100tr: 1,0 · ≥500tr: 1,1 · ≥1 tỷ: 1,2 · ≥1,5 tỷ: 1,3).
6. **KPI 100 điểm**: Đ1 doanh thu/mục tiêu ×40 (+5 nếu >120%) · Đ2 nợ quá hạn so thực thu (<5% = 25đ, 5–10% = 15đ, >10% = 0đ) · Đ3 khách mới có đơn đầu trong tháng (≥3 = 15đ, 2 = 10đ, 1 = 5đ — hệ thống tự đếm) · Đ4 tỷ trọng nhóm A (≥25% = 10đ, ≥15% = 6đ) · Đ5 kỷ luật admin nhập tay 0–10 (nhập ngay trong bảng lương). **Thưởng KPI = 1.000.000 × điểm/100, dưới 50 điểm = 0.**
7. **Tồn kho**: tạo đơn trừ tồn theo SKU; sản phẩm hiện **cảnh báo đỏ** khi tồn < tồn tối thiểu. Đơn chờ duyệt chỉ trừ tồn khi được duyệt.

Tỷ lệ hoa hồng, mục tiêu doanh thu từng sale và lương cơ bản chỉnh được ở menu **Cài đặt**.

---

## PHẦN 7 — CẤU TRÚC KỸ THUẬT (cho người bảo trì)

```
app/                    # các trang Next.js (App Router)
  login/                # đăng nhập
  (app)/dashboard/      # thẻ số + xếp hạng sale
  (app)/san-pham/       # 1.000 SKU, tìm kiếm/lọc, admin sửa inline
  (app)/khach-hang/     # hạn mức, dư nợ, trạng thái KHÓA ĐƠN
  (app)/giao-dich/      # tạo đơn, duyệt đơn, thu tiền từng phần
  (app)/luong-kpi/      # bảng lương tháng
  (app)/import/         # import MISA (admin)
  (app)/cai-dat/        # cấu hình + tài khoản (admin)
  api/admin/users/      # API tạo/khóa tài khoản (dùng service_role key)
lib/                    # kết nối Supabase, định dạng tiền 1.234.567
supabase/schema.sql     # bảng + RLS + toàn bộ logic nghiệp vụ (SQL functions)
supabase/seed.sql       # dữ liệu mẫu để test
middleware.ts           # bảo vệ đăng nhập + tự đăng xuất sau 12h
```

Điểm quan trọng: **mọi logic nghiệp vụ nhạy cảm (áp giá, chặn đơn, trừ tồn, duyệt, hoa hồng, KPI) nằm trong SQL functions phía Supabase**, không nằm ở trình duyệt — sale không thể lách bằng cách sửa request. RLS bật trên mọi bảng: sale chỉ đọc được dữ liệu có `sale_id` của mình.

Lưu ý so với đặc tả gốc: có thêm bảng `transaction_items` (chi tiết SKU + số lượng của từng hóa đơn) — bắt buộc phải có để trừ tồn kho theo SKU; cột `nhom` của hóa đơn được tự tính theo nhóm hàng chiếm giá trị lớn nhất trong đơn.
