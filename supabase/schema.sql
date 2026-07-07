-- =====================================================================
-- PQH OPS — Schema CSDL (chạy trong Supabase SQL Editor, chạy TRƯỚC seed.sql)
-- Theo Quy chế 01/2026/QC-PQH
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. BẢNG
-- ---------------------------------------------------------------------

-- Hồ sơ người dùng (admin tạo tài khoản, không cho tự đăng ký)
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  ho_ten     text not null,
  role       text not null default 'sale' check (role in ('admin', 'sale')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Sản phẩm: 3 mức giá SLL < Sỉ < CTV, nhóm A/B/C/D theo biên lợi nhuận
create table if not exists public.products (
  id       bigint generated always as identity primary key,
  sku      text not null unique,
  ten      text not null,
  hang     text not null,
  nhom     char(1) not null check (nhom in ('A', 'B', 'C', 'D')),
  gia_sll  numeric not null check (gia_sll >= 0),
  gia_si   numeric not null check (gia_si >= 0),
  gia_ctv  numeric not null check (gia_ctv >= 0),
  gia_von  numeric not null default 0 check (gia_von >= 0),
  ton      integer not null default 0,
  ton_min  integer not null default 0,
  active   boolean not null default true
);

-- Khách hàng: loai = SLL / SI (Sỉ) / CTV / MOI (Mới)
create table if not exists public.customers (
  id             bigint generated always as identity primary key,
  ma             text not null unique,
  ten            text not null,
  loai           text not null check (loai in ('SLL', 'SI', 'CTV', 'MOI')),
  sale_id        uuid not null references public.profiles (user_id),
  ds_tb_3thang   numeric not null default 0 check (ds_tb_3thang >= 0),
  created_at     timestamptz not null default now()
);

-- Giao dịch (hóa đơn). trang_thai='cho_duyet' khi vượt hạn mức chờ GĐ duyệt
create table if not exists public.transactions (
  id          bigint generated always as identity primary key,
  ngay        date not null default current_date,
  so_hd       text not null,
  sale_id     uuid not null references public.profiles (user_id),
  customer_id bigint not null references public.customers (id),
  nhom        char(1) not null check (nhom in ('A', 'B', 'C', 'D')),
  doanh_thu   numeric not null check (doanh_thu >= 0),
  created_by  uuid not null references public.profiles (user_id),
  duyet_gd    boolean not null default false,
  trang_thai  text not null default 'da_ghi' check (trang_thai in ('cho_duyet', 'da_ghi', 'tu_choi')),
  duyet_boi   uuid references public.profiles (user_id),
  duyet_luc   timestamptz,
  created_at  timestamptz not null default now()
);

-- Chi tiết dòng hàng của giao dịch (để trừ tồn kho theo SKU)
create table if not exists public.transaction_items (
  id             bigint generated always as identity primary key,
  transaction_id bigint not null references public.transactions (id) on delete cascade,
  product_id     bigint not null references public.products (id),
  so_luong       integer not null check (so_luong > 0),
  don_gia        numeric not null check (don_gia >= 0),
  thanh_tien     numeric not null check (thanh_tien >= 0)
);

-- Thu tiền: 1 hóa đơn có thể thu nhiều lần
create table if not exists public.payments (
  id             bigint generated always as identity primary key,
  transaction_id bigint not null references public.transactions (id),
  ngay_thu       date not null default current_date,
  so_tien        numeric not null check (so_tien > 0),
  created_by     uuid references public.profiles (user_id),
  created_at     timestamptz not null default now()
);

-- Cấu hình: tỷ lệ HH nhóm, hệ số quy mô, mục tiêu sale, lương cơ bản
create table if not exists public.settings (
  key   text primary key,
  value jsonb not null
);

-- Điểm kỷ luật nhập tay hàng tháng (0-10)
create table if not exists public.kpi_inputs (
  thang   text not null,  -- 'YYYY-MM'
  sale_id uuid not null references public.profiles (user_id),
  ky_luat integer not null default 10 check (ky_luat between 0 and 10),
  primary key (thang, sale_id)
);

create index if not exists idx_customers_sale on public.customers (sale_id);
create index if not exists idx_transactions_sale on public.transactions (sale_id);
create index if not exists idx_transactions_customer on public.transactions (customer_id);
create index if not exists idx_transactions_ngay on public.transactions (ngay);
create index if not exists idx_payments_transaction on public.payments (transaction_id);
create index if not exists idx_payments_ngay on public.payments (ngay_thu);
create index if not exists idx_items_transaction on public.transaction_items (transaction_id);

-- ---------------------------------------------------------------------
-- 2. HÀM TIỆN ÍCH
-- ---------------------------------------------------------------------

-- Kiểm tra người gọi có phải admin (security definer để tránh đệ quy RLS)
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid() and role = 'admin' and active
  );
$$;

-- Số ngày nợ chuẩn theo loại khách: Sỉ 15 ngày, SLL 30 ngày, CTV/Mới trả trước
create or replace function public.so_ngay_no(p_loai text)
returns integer
language sql immutable
as $$
  select case p_loai when 'SI' then 15 when 'SLL' then 30 else 0 end;
$$;

-- Hạn mức tín dụng: Sỉ = min(50% ds_tb, 100tr); SLL = min(ds_tb, 300tr); CTV/Mới = 0
create or replace function public.han_muc_tin_dung(p_loai text, p_ds_tb numeric)
returns numeric
language sql immutable
as $$
  select case p_loai
    when 'SI'  then least(0.5 * coalesce(p_ds_tb, 0), 100000000)
    when 'SLL' then least(coalesce(p_ds_tb, 0), 300000000)
    else 0
  end;
$$;

-- Hệ số tuổi nợ cho hoa hồng: đúng hạn 100%, trễ ≤30 ngày 70%, ≤60 ngày 50%, >60 ngày 0%
create or replace function public.he_so_tuoi_no(p_ngay_tre integer)
returns numeric
language sql immutable
as $$
  select case
    when p_ngay_tre <= 0  then 1.0
    when p_ngay_tre <= 30 then 0.7
    when p_ngay_tre <= 60 then 0.5
    else 0.0
  end;
$$;

-- ---------------------------------------------------------------------
-- 3. VIEW CÔNG NỢ (security_invoker để tôn trọng RLS của người truy vấn)
-- ---------------------------------------------------------------------

-- Công nợ từng hóa đơn đã ghi
create or replace view public.v_cong_no_hd
with (security_invoker = on)
as
select
  t.id,
  t.ngay,
  t.so_hd,
  t.sale_id,
  t.customer_id,
  t.nhom,
  t.doanh_thu,
  t.trang_thai,
  t.duyet_gd,
  coalesce(p.da_thu, 0)                                   as da_thu,
  t.doanh_thu - coalesce(p.da_thu, 0)                     as con_no,
  (t.ngay + public.so_ngay_no(c.loai))::date              as han_tt,
  greatest(0, current_date - (t.ngay + public.so_ngay_no(c.loai)))::integer as so_ngay_qua_han
from public.transactions t
join public.customers c on c.id = t.customer_id
left join (
  select transaction_id, sum(so_tien) as da_thu
  from public.payments
  group by transaction_id
) p on p.transaction_id = t.id
where t.trang_thai = 'da_ghi';

-- Tình trạng khách hàng: hạn mức, dư nợ, nợ quá hạn, khóa đơn
create or replace view public.v_khach_hang
with (security_invoker = on)
as
select
  c.id,
  c.ma,
  c.ten,
  c.loai,
  c.sale_id,
  c.ds_tb_3thang,
  public.han_muc_tin_dung(c.loai, c.ds_tb_3thang)  as han_muc,
  coalesce(n.du_no, 0)                              as du_no,
  coalesce(n.no_qua_han, 0)                         as no_qua_han,
  -- KHÓA ĐƠN khi có nợ quá hạn trên 7 ngày
  coalesce(n.qua_han_7, false)                      as khoa_don
from public.customers c
left join (
  select
    customer_id,
    sum(con_no)                                                  as du_no,
    sum(con_no) filter (where con_no > 0 and so_ngay_qua_han > 0) as no_qua_han,
    bool_or(con_no > 0 and so_ngay_qua_han > 7)                   as qua_han_7
  from public.v_cong_no_hd
  group by customer_id
) n on n.customer_id = c.id;

-- ---------------------------------------------------------------------
-- 4. NGHIỆP VỤ: TẠO ĐƠN / DUYỆT / THU TIỀN (RPC, security definer)
-- ---------------------------------------------------------------------

-- Tạo giao dịch. p_items = [{"product_id":1,"so_luong":2}, ...]
-- Giá tự áp theo loại khách (sale không gõ tay giá).
-- Nếu khách bị chặn: p_gui_duyet=false → lỗi 'KHOA_DON'; p_gui_duyet=true → tạo đơn chờ GĐ duyệt.
create or replace function public.tao_giao_dich(
  p_customer_id bigint,
  p_ngay        date,
  p_so_hd       text,
  p_items       jsonb,
  p_gui_duyet   boolean default false
)
returns bigint
language plpgsql security definer set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_kh        record;
  v_item      record;
  v_prod      record;
  v_don_gia   numeric;
  v_tong      numeric := 0;
  v_nhom      char(1);
  v_bi_chan   boolean := false;
  v_ly_do     text := '';
  v_txn_id    bigint;
  v_du_no     numeric;
  v_han_muc   numeric;
  v_qua_han_7 boolean;
begin
  if v_uid is null then
    raise exception 'Chưa đăng nhập';
  end if;

  select * into v_kh from customers where id = p_customer_id;
  if not found then
    raise exception 'Không tìm thấy khách hàng';
  end if;

  -- sale chỉ được tạo đơn cho khách mình phụ trách
  if not is_admin() and v_kh.sale_id <> v_uid then
    raise exception 'Bạn không phụ trách khách hàng này';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Đơn hàng chưa có sản phẩm';
  end if;

  -- Tính tổng tiền theo mức giá của loại khách + kiểm tra tồn
  for v_item in
    select (e->>'product_id')::bigint as product_id, (e->>'so_luong')::int as so_luong
    from jsonb_array_elements(p_items) e
  loop
    select * into v_prod from products where id = v_item.product_id and active;
    if not found then
      raise exception 'Sản phẩm không tồn tại hoặc ngừng bán (id=%)', v_item.product_id;
    end if;
    if v_item.so_luong is null or v_item.so_luong <= 0 then
      raise exception 'Số lượng không hợp lệ cho SKU %', v_prod.sku;
    end if;
    if v_prod.ton < v_item.so_luong then
      raise exception 'TON_KHO: SKU % chỉ còn tồn %', v_prod.sku, v_prod.ton;
    end if;
    v_don_gia := case v_kh.loai
      when 'SLL' then v_prod.gia_sll
      when 'SI'  then v_prod.gia_si
      else v_prod.gia_ctv
    end;
    v_tong := v_tong + v_don_gia * v_item.so_luong;
  end loop;

  -- Nhóm của đơn = nhóm có giá trị hàng lớn nhất trong đơn
  select p.nhom into v_nhom
  from jsonb_array_elements(p_items) e
  join products p on p.id = (e->>'product_id')::bigint
  group by p.nhom
  order by sum(
    case v_kh.loai when 'SLL' then p.gia_sll when 'SI' then p.gia_si else p.gia_ctv end
    * (e->>'so_luong')::int
  ) desc
  limit 1;

  -- Kiểm tra chặn đơn
  select v.du_no, v.han_muc, v.khoa_don
    into v_du_no, v_han_muc, v_qua_han_7
  from v_khach_hang v where v.id = p_customer_id;

  if v_qua_han_7 then
    v_bi_chan := true;
    v_ly_do := 'khách có nợ quá hạn trên 7 ngày';
  elsif v_du_no + v_tong > v_han_muc then
    v_bi_chan := true;
    v_ly_do := 'dư nợ ' || v_du_no || ' + đơn mới ' || v_tong || ' vượt hạn mức ' || v_han_muc;
  end if;

  if v_bi_chan and not p_gui_duyet then
    raise exception 'KHOA_DON: %', v_ly_do;
  end if;

  insert into transactions (ngay, so_hd, sale_id, customer_id, nhom, doanh_thu, created_by, duyet_gd, trang_thai)
  values (
    coalesce(p_ngay, current_date), p_so_hd, v_kh.sale_id, p_customer_id,
    coalesce(v_nhom, 'D'), v_tong, v_uid,
    false,
    case when v_bi_chan then 'cho_duyet' else 'da_ghi' end
  )
  returning id into v_txn_id;

  for v_item in
    select (e->>'product_id')::bigint as product_id, (e->>'so_luong')::int as so_luong
    from jsonb_array_elements(p_items) e
  loop
    select * into v_prod from products where id = v_item.product_id;
    v_don_gia := case v_kh.loai
      when 'SLL' then v_prod.gia_sll
      when 'SI'  then v_prod.gia_si
      else v_prod.gia_ctv
    end;
    insert into transaction_items (transaction_id, product_id, so_luong, don_gia, thanh_tien)
    values (v_txn_id, v_item.product_id, v_item.so_luong, v_don_gia, v_don_gia * v_item.so_luong);
  end loop;

  -- Đơn ghi ngay thì trừ tồn kho; đơn chờ duyệt trừ khi GĐ duyệt
  if not v_bi_chan then
    update products p
    set ton = p.ton - i.so_luong
    from transaction_items i
    where i.transaction_id = v_txn_id and i.product_id = p.id;
  end if;

  return v_txn_id;
end;
$$;

-- Giám đốc duyệt đơn vượt hạn mức: ghi đơn + trừ tồn + log ai duyệt lúc nào
create or replace function public.duyet_giao_dich(p_transaction_id bigint, p_dong_y boolean default true)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_txn record;
  v_thieu text;
begin
  if not is_admin() then
    raise exception 'Chỉ Giám đốc được duyệt đơn';
  end if;

  select * into v_txn from transactions where id = p_transaction_id for update;
  if not found or v_txn.trang_thai <> 'cho_duyet' then
    raise exception 'Đơn không ở trạng thái chờ duyệt';
  end if;

  if not p_dong_y then
    update transactions
    set trang_thai = 'tu_choi', duyet_boi = auth.uid(), duyet_luc = now()
    where id = p_transaction_id;
    return;
  end if;

  select string_agg(p.sku, ', ') into v_thieu
  from transaction_items i join products p on p.id = i.product_id
  where i.transaction_id = p_transaction_id and p.ton < i.so_luong;
  if v_thieu is not null then
    raise exception 'TON_KHO: không đủ tồn cho SKU: %', v_thieu;
  end if;

  update products p
  set ton = p.ton - i.so_luong
  from transaction_items i
  where i.transaction_id = p_transaction_id and i.product_id = p.id;

  update transactions
  set trang_thai = 'da_ghi', duyet_gd = true, duyet_boi = auth.uid(), duyet_luc = now()
  where id = p_transaction_id;
end;
$$;

-- Ghi thu tiền từng phần cho hóa đơn
create or replace function public.ghi_thu_tien(
  p_transaction_id bigint,
  p_ngay_thu       date,
  p_so_tien        numeric
)
returns bigint
language plpgsql security definer set search_path = public
as $$
declare
  v_txn    record;
  v_con_no numeric;
  v_id     bigint;
begin
  select * into v_txn from transactions where id = p_transaction_id;
  if not found then
    raise exception 'Không tìm thấy hóa đơn';
  end if;
  if v_txn.trang_thai <> 'da_ghi' then
    raise exception 'Hóa đơn chưa được ghi nhận (chờ duyệt/từ chối)';
  end if;
  if not is_admin() and v_txn.sale_id <> auth.uid() then
    raise exception 'Bạn không phụ trách hóa đơn này';
  end if;
  if p_so_tien is null or p_so_tien <= 0 then
    raise exception 'Số tiền thu phải lớn hơn 0';
  end if;

  select v_txn.doanh_thu - coalesce(sum(so_tien), 0) into v_con_no
  from payments where transaction_id = p_transaction_id;
  if p_so_tien > v_con_no then
    raise exception 'Số tiền thu (%) vượt số còn nợ (%)', p_so_tien, v_con_no;
  end if;

  insert into payments (transaction_id, ngay_thu, so_tien, created_by)
  values (p_transaction_id, coalesce(p_ngay_thu, current_date), p_so_tien, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. LƯƠNG — HOA HỒNG — KPI
-- ---------------------------------------------------------------------

-- Bảng lương tháng (p_thang = 'YYYY-MM').
-- Admin thấy cả team; sale chỉ thấy dòng của mình.
create or replace function public.bang_luong_thang(p_thang text)
returns table (
  sale_id       uuid,
  ho_ten        text,
  muc_tieu      numeric,
  doanh_thu     numeric,
  thuc_thu      numeric,
  hh_dong       numeric,
  he_so_quy_mo  numeric,
  hoa_hong      numeric,
  d1            numeric,
  d2            numeric,
  d3            numeric,
  d4            numeric,
  d5            numeric,
  kpi           numeric,
  thuong_kpi    numeric,
  luong_co_ban  numeric,
  tong_luong    numeric,
  no_qua_han    numeric,
  khach_moi     integer,
  ty_trong_a    numeric
)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_start    date := to_date(p_thang || '-01', 'YYYY-MM-DD');
  v_end      date := (to_date(p_thang || '-01', 'YYYY-MM-DD') + interval '1 month')::date;
  v_ty_le    jsonb := coalesce((select value from settings where key = 'ty_le_hh'),
                               '{"A":0.012,"B":0.008,"C":0.004,"D":0}'::jsonb);
  v_muc_tieu jsonb := coalesce((select value from settings where key = 'muc_tieu_sale'), '{}'::jsonb);
  v_lcb      jsonb := coalesce((select value from settings where key = 'luong_co_ban'), '{}'::jsonb);
begin
  return query
  with sales as (
    select p.user_id, p.ho_ten as ten
    from profiles p
    where p.role = 'sale' and p.active
      and (is_admin() or p.user_id = auth.uid())
  ),
  -- Doanh thu đơn đã ghi trong tháng
  dt as (
    select t.sale_id as sid,
           sum(t.doanh_thu) as doanh_thu,
           sum(t.doanh_thu) filter (where t.nhom = 'A') as dt_a
    from transactions t
    where t.trang_thai = 'da_ghi' and t.ngay >= v_start and t.ngay < v_end
    group by t.sale_id
  ),
  -- Hoa hồng dòng: tiền thu × tỷ lệ nhóm × hệ số tuổi nợ; thực thu tháng
  thu as (
    select t.sale_id as sid,
           sum(pm.so_tien) as thuc_thu,
           sum(
             pm.so_tien
             * coalesce((v_ty_le ->> t.nhom)::numeric, 0)
             * he_so_tuoi_no((pm.ngay_thu - (t.ngay + so_ngay_no(c.loai)))::int)
           ) as hh_dong
    from payments pm
    join transactions t on t.id = pm.transaction_id and t.trang_thai = 'da_ghi'
    join customers c on c.id = t.customer_id
    where pm.ngay_thu >= v_start and pm.ngay_thu < v_end
    group by t.sale_id
  ),
  -- Nợ quá hạn hiện tại của khách do sale phụ trách
  nqh as (
    select v.sale_id as sid, coalesce(sum(v.no_qua_han), 0) as no_qua_han
    from v_khach_hang v
    group by v.sale_id
  ),
  -- Khách mới: có đơn ĐẦU TIÊN trong tháng
  km as (
    select c.sale_id as sid, count(*)::int as khach_moi
    from (
      select t.customer_id, min(t.ngay) as don_dau
      from transactions t
      where t.trang_thai = 'da_ghi'
      group by t.customer_id
    ) f
    join customers c on c.id = f.customer_id
    where f.don_dau >= v_start and f.don_dau < v_end
    group by c.sale_id
  ),
  ky as (
    select k.sale_id as sid, k.ky_luat
    from kpi_inputs k
    where k.thang = p_thang
  )
  select
    s.user_id,
    s.ten,
    mt.muc_tieu,
    coalesce(dt.doanh_thu, 0),
    coalesce(thu.thuc_thu, 0),
    round(coalesce(thu.hh_dong, 0)),
    hsqm.he_so,
    round(coalesce(thu.hh_dong, 0) * hsqm.he_so),
    kpi_calc.d1, kpi_calc.d2, kpi_calc.d3, kpi_calc.d4, kpi_calc.d5,
    kpi_calc.tong,
    case when kpi_calc.tong < 50 then 0
         else round(1000000 * kpi_calc.tong / 100) end,
    lcb.luong,
    lcb.luong
      + round(coalesce(thu.hh_dong, 0) * hsqm.he_so)
      + case when kpi_calc.tong < 50 then 0 else round(1000000 * kpi_calc.tong / 100) end,
    coalesce(nqh.no_qua_han, 0),
    coalesce(km.khach_moi, 0),
    kpi_calc.ty_trong_a
  from sales s
  left join dt  on dt.sid  = s.user_id
  left join thu on thu.sid = s.user_id
  left join nqh on nqh.sid = s.user_id
  left join km  on km.sid  = s.user_id
  left join ky  on ky.sid  = s.user_id
  cross join lateral (
    select coalesce((v_muc_tieu ->> s.user_id::text)::numeric, 0) as muc_tieu
  ) mt
  cross join lateral (
    select coalesce(
      (v_lcb ->> s.user_id::text)::numeric,
      (v_lcb ->> 'mac_dinh')::numeric,
      0
    ) as luong
  ) lcb
  cross join lateral (
    -- Hệ số quy mô theo tổng thực thu: <100tr:0 · ≥100tr:1,0 · ≥500tr:1,1 · ≥1 tỷ:1,2 · ≥1,5 tỷ:1,3
    select case
      when coalesce(thu.thuc_thu, 0) >= 1500000000 then 1.3
      when coalesce(thu.thuc_thu, 0) >= 1000000000 then 1.2
      when coalesce(thu.thuc_thu, 0) >=  500000000 then 1.1
      when coalesce(thu.thuc_thu, 0) >=  100000000 then 1.0
      else 0
    end::numeric as he_so
  ) hsqm
  cross join lateral (
    select
      d1v.v as d1, d2v.v as d2, d3v.v as d3, d4v.v as d4, d5v.v as d5,
      (d1v.v + d2v.v + d3v.v + d4v.v + d5v.v) as tong,
      tta.v as ty_trong_a
    from lateral (
      -- Đ1: doanh thu / mục tiêu × 40, tối đa 40, cộng 5 nếu vượt 120%
      select case
        when mt.muc_tieu <= 0 then 0
        else least(40, round(coalesce(dt.doanh_thu, 0) / mt.muc_tieu * 40, 1))
             + case when coalesce(dt.doanh_thu, 0) > 1.2 * mt.muc_tieu then 5 else 0 end
      end::numeric as v
    ) d1v
    cross join lateral (
      -- Đ2: nợ quá hạn so với thực thu: <5% = 25, 5–10% = 15, >10% = 0
      select case
        when coalesce(thu.thuc_thu, 0) <= 0 then
          case when coalesce(nqh.no_qua_han, 0) = 0 then 25 else 0 end
        when coalesce(nqh.no_qua_han, 0) < 0.05 * thu.thuc_thu then 25
        when coalesce(nqh.no_qua_han, 0) <= 0.10 * thu.thuc_thu then 15
        else 0
      end::numeric as v
    ) d2v
    cross join lateral (
      -- Đ3: khách mới có đơn đầu trong tháng: ≥3 = 15, 2 = 10, 1 = 5
      select case
        when coalesce(km.khach_moi, 0) >= 3 then 15
        when coalesce(km.khach_moi, 0) = 2 then 10
        when coalesce(km.khach_moi, 0) = 1 then 5
        else 0
      end::numeric as v
    ) d3v
    cross join lateral (
      select case
        when coalesce(dt.doanh_thu, 0) <= 0 then 0
        else round(coalesce(dt.dt_a, 0) / dt.doanh_thu, 4)
      end::numeric as v
    ) tta
    cross join lateral (
      -- Đ4: tỷ trọng nhóm A ≥25% = 10, ≥15% = 6
      select case
        when tta.v >= 0.25 then 10
        when tta.v >= 0.15 then 6
        else 0
      end::numeric as v
    ) d4v
    cross join lateral (
      -- Đ5: điểm kỷ luật nhập tay 0–10
      select coalesce(ky.ky_luat, 0)::numeric as v
    ) d5v
  ) kpi_calc;
end;
$$;

-- Bảng xếp hạng sale trong tháng (mọi người đăng nhập đều xem được, chỉ gồm tên + số tổng)
create or replace function public.xep_hang_sale(p_thang text)
returns table (ho_ten text, thuc_thu numeric, doanh_thu numeric)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_start date := to_date(p_thang || '-01', 'YYYY-MM-DD');
  v_end   date := (to_date(p_thang || '-01', 'YYYY-MM-DD') + interval '1 month')::date;
begin
  if auth.uid() is null then
    raise exception 'Chưa đăng nhập';
  end if;
  return query
  select
    p.ho_ten,
    coalesce((
      select sum(pm.so_tien) from payments pm
      join transactions t on t.id = pm.transaction_id and t.trang_thai = 'da_ghi'
      where t.sale_id = p.user_id and pm.ngay_thu >= v_start and pm.ngay_thu < v_end
    ), 0),
    coalesce((
      select sum(t.doanh_thu) from transactions t
      where t.sale_id = p.user_id and t.trang_thai = 'da_ghi'
        and t.ngay >= v_start and t.ngay < v_end
    ), 0)
  from profiles p
  where p.role = 'sale' and p.active
  order by 2 desc;
end;
$$;

-- Tự tạo profile khi admin tạo user mới (đọc họ tên + role từ metadata nếu có)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, ho_ten, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'ho_ten', split_part(new.email, '@', 1)),
    case when coalesce(new.raw_user_meta_data ->> 'role', 'sale') = 'admin' then 'admin' else 'sale' end
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.profiles          enable row level security;
alter table public.products          enable row level security;
alter table public.customers         enable row level security;
alter table public.transactions      enable row level security;
alter table public.transaction_items enable row level security;
alter table public.payments          enable row level security;
alter table public.settings          enable row level security;
alter table public.kpi_inputs        enable row level security;

-- profiles: ai cũng xem được danh sách (cần cho xếp hạng, chọn sale); chỉ admin sửa
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);
drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- products: mọi người xem đủ 3 giá; chỉ admin sửa (giá, tồn, thêm SKU)
drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select to authenticated using (true);
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- customers: sale chỉ thấy khách mình phụ trách; admin thấy hết
drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers
  for select to authenticated using (public.is_admin() or sale_id = auth.uid());
drop policy if exists customers_sale_insert on public.customers;
create policy customers_sale_insert on public.customers
  for insert to authenticated with check (public.is_admin() or sale_id = auth.uid());
drop policy if exists customers_admin_update on public.customers;
create policy customers_admin_update on public.customers
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists customers_admin_delete on public.customers;
create policy customers_admin_delete on public.customers
  for delete to authenticated using (public.is_admin());

-- transactions: sale chỉ thấy giao dịch của mình (ghi qua RPC tao_giao_dich)
drop policy if exists transactions_select on public.transactions;
create policy transactions_select on public.transactions
  for select to authenticated using (public.is_admin() or sale_id = auth.uid());

-- transaction_items: theo giao dịch cha
drop policy if exists items_select on public.transaction_items;
create policy items_select on public.transaction_items
  for select to authenticated using (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_id and (public.is_admin() or t.sale_id = auth.uid())
    )
  );

-- payments: theo giao dịch cha (ghi qua RPC ghi_thu_tien)
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
  for select to authenticated using (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_id and (public.is_admin() or t.sale_id = auth.uid())
    )
  );

-- settings: chỉ admin (chứa lương cơ bản, mục tiêu — hàm lương đọc qua security definer)
drop policy if exists settings_admin_all on public.settings;
create policy settings_admin_all on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- kpi_inputs: sale xem điểm của mình; admin xem/sửa tất cả
drop policy if exists kpi_select on public.kpi_inputs;
create policy kpi_select on public.kpi_inputs
  for select to authenticated using (public.is_admin() or sale_id = auth.uid());
drop policy if exists kpi_admin_write on public.kpi_inputs;
create policy kpi_admin_write on public.kpi_inputs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 7. QUYỀN THỰC THI
-- ---------------------------------------------------------------------

revoke execute on all functions in schema public from anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.tao_giao_dich(bigint, date, text, jsonb, boolean) to authenticated;
grant execute on function public.duyet_giao_dich(bigint, boolean) to authenticated;
grant execute on function public.ghi_thu_tien(bigint, date, numeric) to authenticated;
grant execute on function public.bang_luong_thang(text) to authenticated;
grant execute on function public.xep_hang_sale(text) to authenticated;
