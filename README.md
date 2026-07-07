# PQH OPS — Web quản lý bán hàng nội bộ

Web app thay Google Sheets cho Công ty TNHH Phi Quốc Huy (phân phối hàng gia dụng nhập khẩu, ~1.000 SKU, 6 sale B2B). Giao diện tiếng Việt, mobile-first.

- **Next.js 14** (App Router) + Tailwind CSS → deploy **Vercel** (free)
- **Supabase** (free): PostgreSQL + Auth + Row Level Security
- Nghiệp vụ theo **Quy chế 01/2026/QC-PQH**: 3 mức giá, hạn mức tín dụng, chặn đơn nợ quá hạn, hoa hồng theo tuổi nợ, KPI 100 điểm

## Chạy nhanh

```bash
npm install
cp .env.example .env.local   # điền khóa Supabase
npm run dev
```

Tài khoản demo sau khi chạy seed: `admin@pqh.vn` / `PQH@2026`.

**Đọc `HUONG-DAN.md` để biết đầy đủ**: cách tạo project Supabase, chạy `supabase/schema.sql` + `supabase/seed.sql`, deploy Vercel, tạo tài khoản nhân viên và quy trình import MISA hàng ngày.
