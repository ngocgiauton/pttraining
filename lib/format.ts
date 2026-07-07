// Định dạng số tiền kiểu Việt Nam: 1.234.567
export function formatMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(Number(n))) return "0";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    Number(n)
  );
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("vi-VN");
}

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const LOAI_KHACH: Record<string, string> = {
  SLL: "Số lượng lớn",
  SI: "Sỉ",
  CTV: "Cộng tác viên",
  MOI: "Khách mới",
};

export const NO_CHUAN: Record<string, number> = {
  SI: 15,
  SLL: 30,
  CTV: 0,
  MOI: 0,
};

// Chuyển chuỗi nhập "1.234.567" hoặc "1234567" thành số
export function parseMoney(s: string): number {
  const cleaned = s.replace(/[.\s,đ₫]/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}
