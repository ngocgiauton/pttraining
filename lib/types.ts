export type Role = "admin" | "sale";

export interface Profile {
  user_id: string;
  ho_ten: string;
  role: Role;
  active: boolean;
}

export interface Product {
  id: number;
  sku: string;
  ten: string;
  hang: string;
  nhom: "A" | "B" | "C" | "D";
  gia_sll: number;
  gia_si: number;
  gia_ctv: number;
  gia_von: number;
  ton: number;
  ton_min: number;
  active: boolean;
}

export interface KhachHang {
  id: number;
  ma: string;
  ten: string;
  loai: "SLL" | "SI" | "CTV" | "MOI";
  sale_id: string;
  ds_tb_3thang: number;
  han_muc: number;
  du_no: number;
  no_qua_han: number;
  khoa_don: boolean;
}

export interface CongNoHD {
  id: number;
  ngay: string;
  so_hd: string;
  sale_id: string;
  customer_id: number;
  nhom: string;
  doanh_thu: number;
  trang_thai: string;
  duyet_gd: boolean;
  da_thu: number;
  con_no: number;
  han_tt: string;
  so_ngay_qua_han: number;
}

export interface BangLuongRow {
  sale_id: string;
  ho_ten: string;
  muc_tieu: number;
  doanh_thu: number;
  thuc_thu: number;
  hh_dong: number;
  he_so_quy_mo: number;
  hoa_hong: number;
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  d5: number;
  kpi: number;
  thuong_kpi: number;
  luong_co_ban: number;
  tong_luong: number;
  no_qua_han: number;
  khach_moi: number;
  ty_trong_a: number;
}
