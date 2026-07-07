-- =====================================================================
-- PQH OPS — Dữ liệu mẫu để test (chạy SAU schema.sql, trong SQL Editor)
-- Tạo: 1 admin + 6 sale, 20 SKU, 8 khách hàng, cấu hình, giao dịch mẫu.
-- Mật khẩu chung của mọi tài khoản demo: PQH@2026
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TÀI KHOẢN (admin + 6 sale) — tạo thẳng trong auth.users
--    Trigger handle_new_user sẽ tự tạo profiles kèm họ tên + role.
-- ---------------------------------------------------------------------
do $$
declare
  v_users constant jsonb := '[
    {"id":"a0000000-0000-0000-0000-000000000001","email":"admin@pqh.vn","ho_ten":"Phi Quốc Huy","role":"admin"},
    {"id":"a0000000-0000-0000-0000-000000000011","email":"sale1@pqh.vn","ho_ten":"Nguyễn Văn An","role":"sale"},
    {"id":"a0000000-0000-0000-0000-000000000012","email":"sale2@pqh.vn","ho_ten":"Trần Thị Bích","role":"sale"},
    {"id":"a0000000-0000-0000-0000-000000000013","email":"sale3@pqh.vn","ho_ten":"Lê Minh Cường","role":"sale"},
    {"id":"a0000000-0000-0000-0000-000000000014","email":"sale4@pqh.vn","ho_ten":"Phạm Thu Dung","role":"sale"},
    {"id":"a0000000-0000-0000-0000-000000000015","email":"sale5@pqh.vn","ho_ten":"Hoàng Văn Em","role":"sale"},
    {"id":"a0000000-0000-0000-0000-000000000016","email":"sale6@pqh.vn","ho_ten":"Võ Thị Phượng","role":"sale"}
  ]'::jsonb;
  u jsonb;
begin
  for u in select * from jsonb_array_elements(v_users)
  loop
    if not exists (select 1 from auth.users where id = (u->>'id')::uuid) then
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at
      ) values (
        (u->>'id')::uuid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        u->>'email',
        crypt('PQH@2026', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('ho_ten', u->>'ho_ten', 'role', u->>'role'),
        now(), now()
      );
      insert into auth.identities (
        id, user_id, provider_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(),
        (u->>'id')::uuid,
        u->>'id',
        jsonb_build_object('sub', u->>'id', 'email', u->>'email', 'email_verified', true),
        'email',
        now(), now(), now()
      );
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 2. CẤU HÌNH (settings)
-- ---------------------------------------------------------------------
insert into public.settings (key, value) values
  ('ty_le_hh', '{"A": 0.012, "B": 0.008, "C": 0.004, "D": 0}'),
  ('he_so_quy_mo', '[
      {"tu": 0,          "he_so": 0},
      {"tu": 100000000,  "he_so": 1.0},
      {"tu": 500000000,  "he_so": 1.1},
      {"tu": 1000000000, "he_so": 1.2},
      {"tu": 1500000000, "he_so": 1.3}
   ]'),
  ('muc_tieu_sale', '{
      "a0000000-0000-0000-0000-000000000011": 300000000,
      "a0000000-0000-0000-0000-000000000012": 300000000,
      "a0000000-0000-0000-0000-000000000013": 250000000,
      "a0000000-0000-0000-0000-000000000014": 250000000,
      "a0000000-0000-0000-0000-000000000015": 200000000,
      "a0000000-0000-0000-0000-000000000016": 200000000
   }'),
  ('luong_co_ban', '{"mac_dinh": 8000000}')
on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------
-- 3. SẢN PHẨM — 20 SKU mẫu (giá SLL < Sỉ < CTV)
-- ---------------------------------------------------------------------
insert into public.products (sku, ten, hang, nhom, gia_sll, gia_si, gia_ctv, gia_von, ton, ton_min, active) values
  ('TEF-CHAO28',  'Chảo chống dính Tefal Unlimited 28cm',      'Tefal',     'A',  850000,  920000,  990000,  640000, 120, 20, true),
  ('TEF-CHAO24',  'Chảo chống dính Tefal Start Easy 24cm',     'Tefal',     'B',  450000,  490000,  530000,  360000, 200, 30, true),
  ('TEF-NOI20',   'Nồi Tefal Duetto+ 20cm inox',               'Tefal',     'B',  980000, 1060000, 1140000,  790000,  80, 15, true),
  ('TEF-BANLA',   'Bàn là hơi nước Tefal Express Steam',       'Tefal',     'C', 1150000, 1240000, 1330000,  990000,  60, 10, true),
  ('TEF-MAYXAY',  'Máy xay sinh tố Tefal Blendforce 800W',     'Tefal',     'B', 1350000, 1460000, 1570000, 1080000,  45, 10, true),
  ('OWL-BINH1L',  'Bình giữ nhiệt O''well 1L inox 304',        'O''well',   'A',  320000,  350000,  380000,  230000, 300, 50, true),
  ('OWL-BINH500', 'Bình giữ nhiệt O''well 500ml',              'O''well',   'A',  240000,  265000,  290000,  170000, 350, 50, true),
  ('OWL-HOPCOM',  'Hộp cơm giữ nhiệt O''well 3 ngăn',          'O''well',   'B',  410000,  445000,  480000,  320000, 150, 25, true),
  ('OWL-CAMBIEN', 'Ấm đun siêu tốc O''well cảm biến 1.7L',     'O''well',   'C',  520000,  560000,  600000,  440000,  90, 15, true),
  ('KAI-DAO3',    'Bộ dao Kaiyo Nhật 3 món thép Damascus',     'Kaiyo',     'A', 1650000, 1790000, 1930000, 1200000,  40,  8, true),
  ('KAI-THOT',    'Thớt kháng khuẩn Kaiyo cao cấp',            'Kaiyo',     'C',  280000,  305000,  330000,  235000, 180, 30, true),
  ('KAI-KEO',     'Kéo bếp đa năng Kaiyo',                     'Kaiyo',     'D',  120000,  132000,  145000,  105000, 250, 40, true),
  ('KAI-NOICOM',  'Nồi cơm điện cao tần Kaiyo 1.8L',           'Kaiyo',     'A', 2850000, 3080000, 3320000, 2100000,  30,  6, true),
  ('ZOJ-NOICOM',  'Nồi cơm điện tử Zojirushi NS-ZLQ10 1L',     'Zojirushi', 'A', 4200000, 4540000, 4890000, 3150000,  25,  5, true),
  ('ZOJ-BINHTHUY','Bình thủy điện Zojirushi CD-WBQ30 3L',      'Zojirushi', 'B', 2450000, 2650000, 2850000, 1990000,  35,  8, true),
  ('ZOJ-BINHMANG','Bình mang đi Zojirushi SM-TA48 480ml',      'Zojirushi', 'B',  720000,  780000,  840000,  580000, 110, 20, true),
  ('ZOJ-MAYNGHIEN','Máy nghiền đa năng Zojirushi BM-RE08',     'Zojirushi', 'C', 1850000, 2000000, 2150000, 1580000,  20,  5, true),
  ('TEF-OPLA',    'Chảo ốp la Tefal So Chef 20cm',             'Tefal',     'C',  380000,  410000,  440000,  325000,   8, 15, true),
  ('OWL-LYGIU',   'Ly giữ nhiệt O''well 350ml nắp trượt',      'O''well',   'D',  150000,  165000,  180000,  128000, 400, 60, true),
  ('KAI-GANG',    'Găng tay cách nhiệt Kaiyo silicon',         'Kaiyo',     'D',   85000,   95000,  105000,   72000,   5, 20, true)
on conflict (sku) do nothing;

-- ---------------------------------------------------------------------
-- 4. KHÁCH HÀNG — 8 khách phân bổ cho các sale
-- ---------------------------------------------------------------------
insert into public.customers (ma, ten, loai, sale_id, ds_tb_3thang) values
  ('KH001', 'Siêu thị Gia Dụng Minh Anh (Q.1)',      'SLL', 'a0000000-0000-0000-0000-000000000011', 450000000),
  ('KH002', 'Cửa hàng Bếp Việt (Thủ Đức)',            'SI',  'a0000000-0000-0000-0000-000000000011', 120000000),
  ('KH003', 'Đại lý Hoàng Gia (Biên Hòa)',            'SLL', 'a0000000-0000-0000-0000-000000000012', 280000000),
  ('KH004', 'Shop Nhà Xinh Online',                   'CTV', 'a0000000-0000-0000-0000-000000000012',  30000000),
  ('KH005', 'Cửa hàng Kim Ngân (Q.7)',                'SI',  'a0000000-0000-0000-0000-000000000013',  90000000),
  ('KH006', 'CTV Thu Hà (Facebook)',                  'CTV', 'a0000000-0000-0000-0000-000000000014',  15000000),
  ('KH007', 'Siêu thị mini Phúc Lộc (Gò Vấp)',        'SI',  'a0000000-0000-0000-0000-000000000015',  60000000),
  ('KH008', 'Cửa hàng mới Tân Phát (Q.12)',           'MOI', 'a0000000-0000-0000-0000-000000000016',          0)
on conflict (ma) do nothing;

-- ---------------------------------------------------------------------
-- 5. ĐIỂM KỶ LUẬT THÁNG HIỆN TẠI
-- ---------------------------------------------------------------------
insert into public.kpi_inputs (thang, sale_id, ky_luat)
select to_char(current_date, 'YYYY-MM'), user_id, 9
from public.profiles where role = 'sale'
on conflict (thang, sale_id) do nothing;

-- ---------------------------------------------------------------------
-- 6. GIAO DỊCH MẪU (chèn trực tiếp để demo; tồn kho seed coi như đã trừ)
-- ---------------------------------------------------------------------
do $$
declare
  v_kh1 bigint; v_kh2 bigint; v_kh3 bigint; v_kh5 bigint;
  v_t1 bigint; v_t2 bigint; v_t3 bigint; v_t4 bigint;
  v_p_chao bigint; v_p_binh bigint; v_p_noicom bigint; v_p_dao bigint;
begin
  select id into v_kh1 from customers where ma = 'KH001';
  select id into v_kh2 from customers where ma = 'KH002';
  select id into v_kh3 from customers where ma = 'KH003';
  select id into v_kh5 from customers where ma = 'KH005';
  select id into v_p_chao   from products where sku = 'TEF-CHAO28';
  select id into v_p_binh   from products where sku = 'OWL-BINH1L';
  select id into v_p_noicom from products where sku = 'ZOJ-NOICOM';
  select id into v_p_dao    from products where sku = 'KAI-DAO3';

  if exists (select 1 from transactions where so_hd = 'HD-DEMO-001') then
    return; -- đã seed rồi
  end if;

  -- HĐ1: KH001 (SLL, nợ 30 ngày) — đơn tháng này, đã thu một phần
  insert into transactions (ngay, so_hd, sale_id, customer_id, nhom, doanh_thu, created_by, trang_thai)
  values (date_trunc('month', current_date)::date + 2, 'HD-DEMO-001',
          'a0000000-0000-0000-0000-000000000011', v_kh1, 'A', 117000000,
          'a0000000-0000-0000-0000-000000000011', 'da_ghi')
  returning id into v_t1;
  insert into transaction_items (transaction_id, product_id, so_luong, don_gia, thanh_tien) values
    (v_t1, v_p_chao, 100, 850000, 85000000),
    (v_t1, v_p_binh, 100, 320000, 32000000);
  insert into payments (transaction_id, ngay_thu, so_tien) values
    (v_t1, date_trunc('month', current_date)::date + 4, 80000000);

  -- HĐ2: KH002 (Sỉ, nợ 15 ngày) — đơn 40 ngày trước, còn nợ → QUÁ HẠN >7 ngày → KHÓA ĐƠN
  insert into transactions (ngay, so_hd, sale_id, customer_id, nhom, doanh_thu, created_by, trang_thai)
  values (current_date - 40, 'HD-DEMO-002',
          'a0000000-0000-0000-0000-000000000011', v_kh2, 'A', 17900000,
          'a0000000-0000-0000-0000-000000000011', 'da_ghi')
  returning id into v_t2;
  insert into transaction_items (transaction_id, product_id, so_luong, don_gia, thanh_tien) values
    (v_t2, v_p_dao, 10, 1790000, 17900000);
  insert into payments (transaction_id, ngay_thu, so_tien) values
    (v_t2, current_date - 20, 5000000);

  -- HĐ3: KH003 (SLL) — đơn tháng này, đã thu đủ đúng hạn
  insert into transactions (ngay, so_hd, sale_id, customer_id, nhom, doanh_thu, created_by, trang_thai)
  values (date_trunc('month', current_date)::date + 1, 'HD-DEMO-003',
          'a0000000-0000-0000-0000-000000000012', v_kh3, 'A', 42000000,
          'a0000000-0000-0000-0000-000000000012', 'da_ghi')
  returning id into v_t3;
  insert into transaction_items (transaction_id, product_id, so_luong, don_gia, thanh_tien) values
    (v_t3, v_p_noicom, 10, 4200000, 42000000);
  insert into payments (transaction_id, ngay_thu, so_tien) values
    (v_t3, date_trunc('month', current_date)::date + 3, 42000000);

  -- HĐ4: KH005 (Sỉ) — đơn đầu tiên của khách trong tháng này (đếm khách mới cho sale3)
  insert into transactions (ngay, so_hd, sale_id, customer_id, nhom, doanh_thu, created_by, trang_thai)
  values (date_trunc('month', current_date)::date + 3, 'HD-DEMO-004',
          'a0000000-0000-0000-0000-000000000013', v_kh5, 'B', 26500000,
          'a0000000-0000-0000-0000-000000000013', 'da_ghi')
  returning id into v_t4;
  insert into transaction_items (transaction_id, product_id, so_luong, don_gia, thanh_tien)
  select v_t4, id, 10, gia_si, 10 * gia_si from products where sku = 'ZOJ-BINHTHUY';
  insert into payments (transaction_id, ngay_thu, so_tien) values
    (v_t4, date_trunc('month', current_date)::date + 5, 10000000);
end $$;
