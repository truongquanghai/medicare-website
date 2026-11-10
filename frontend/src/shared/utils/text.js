/** Chuẩn hóa chuỗi để so khớp không phân biệt hoa thường và dấu tiếng Việt ("Bảo" ≈ "bao"). */
export const normalizeText = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd');
