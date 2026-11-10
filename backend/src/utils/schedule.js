export const SLOT_MINUTES = 30;
export const CLINIC_TIME_ZONE = 'Asia/Ho_Chi_Minh';

/** Mã ngày làm việc lưu trong cột doctors.work_days, theo thứ tự getUTCDay() (0 = Chủ nhật). */
const DAY_CODES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const WORK_DAYS_PATTERN = /^(T[2-7]|CN)(,(T[2-7]|CN))*$/;
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const toTimeString = (totalMinutes) => {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/** Chuẩn hóa "HH:MM:SS" thành "HH:MM". */
export const trimSeconds = (time) => time.slice(0, 5);

export const isValidDate = (value) => {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const isWorkingDay = (workDays, dateString) => {
  const dayCode = DAY_CODES[new Date(`${dateString}T00:00:00Z`).getUTCDay()];
  return String(workDays).split(',').includes(dayCode);
};

/** Danh sách giờ bắt đầu của các khung khám nằm trọn trong [startTime, endTime). */
export const buildSlots = (startTime, endTime) => {
  const slots = [];
  const end = toMinutes(endTime);
  for (let start = toMinutes(startTime); start + SLOT_MINUTES <= end; start += SLOT_MINUTES) {
    slots.push(toTimeString(start));
  }
  return slots;
};

/** Ngày và số phút trong ngày hiện tại theo múi giờ của phòng khám. */
export const getClinicNow = (now = new Date()) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: CLINIC_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map(({ type, value }) => [type, value]),
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
};

export const isSlotInPast = (date, time, clinicNow = getClinicNow()) =>
  date < clinicNow.date || (date === clinicNow.date && toMinutes(time) <= clinicNow.minutes);
