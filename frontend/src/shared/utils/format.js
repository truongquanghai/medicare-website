const DAY_ORDER = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAY_LABELS = {
  T2: 'Thứ 2',
  T3: 'Thứ 3',
  T4: 'Thứ 4',
  T5: 'Thứ 5',
  T6: 'Thứ 6',
  T7: 'Thứ 7',
  CN: 'Chủ nhật',
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

/** "2026-11-09" → "09/11/2026". */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  return dateFormatter.format(new Date(`${isoDate}T00:00:00`));
}

/** "09:30:00" → "09:30". */
export const formatTime = (time) => (time ? time.slice(0, 5) : '');

/** "2026-11" → "11/2026". */
export const formatMonth = (month) => month.split('-').reverse().join('/');

/** "T2,T3,T4,T5,T6" → "Thứ 2 - Thứ 6"; các ngày rời nhau được liệt kê bằng dấu phẩy. */
export function formatWorkDays(workDays) {
  const selected = new Set(String(workDays ?? '').split(','));
  const runs = [];

  DAY_ORDER.forEach((code, index) => {
    if (!selected.has(code)) return;
    const lastRun = runs.at(-1);
    if (lastRun && lastRun.end === index - 1) lastRun.end = index;
    else runs.push({ start: index, end: index });
  });

  if (!runs.length) return 'Liên hệ';

  return runs
    .map(({ start, end }) => {
      const first = DAY_LABELS[DAY_ORDER[start]];
      const last = DAY_LABELS[DAY_ORDER[end]];
      if (start === end) return first;
      return end - start === 1 ? `${first}, ${last}` : `${first} - ${last}`;
    })
    .join(', ');
}

/** Ngày hôm nay theo giờ máy người dùng, dạng YYYY-MM-DD (dùng cho thuộc tính min của input date). */
export function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
