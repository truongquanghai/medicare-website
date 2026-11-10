import { pool } from './config/db.js';
import { env } from './config/env.js';
import { APPOINTMENT_STATUS, PAYMENT_METHODS, PAYMENT_STATUS, ROLES } from './constants/appointment.js';
import { getClinicNow, isWorkingDay } from './utils/schedule.js';
import { hashPassword } from './utils/user.js';

const DEMO_PASSWORD = '123456';
const DEMO_PHONE = '0901234567';
const TABLES_TO_RESET = ['appointments', 'doctors', 'specialties', 'facilities', 'users'];
const DAY_MS = 24 * 60 * 60 * 1000;

/** Ngày làm việc gần nhất (kể từ 3 ngày tới) của một lịch làm việc, định dạng YYYY-MM-DD. */
const nextWorkingDate = (workDays) => {
  const start = new Date(`${getClinicNow().date}T00:00:00Z`).getTime();
  for (let offset = 3; offset < 10; offset += 1) {
    const date = new Date(start + offset * DAY_MS).toISOString().slice(0, 10);
    if (isWorkingDay(workDays, date)) return date;
  }
  throw new Error('Không tìm được ngày làm việc phù hợp cho lịch khám mẫu.');
};

const insert = async (connection, table, row) => {
  const columns = Object.keys(row);
  const [result] = await connection.query(
    `INSERT INTO \`${table}\` (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    Object.values(row),
  );
  return result.insertId;
};

async function seed() {
  if (env.isProduction) {
    throw new Error('Không chạy seed trong môi trường production: lệnh này xóa toàn bộ dữ liệu.');
  }

  const connection = await pool.getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of TABLES_TO_RESET) await connection.query(`TRUNCATE TABLE \`${table}\``);
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const createUser = (full_name, email, role) =>
      insert(connection, 'users', { full_name, email, password_hash: passwordHash, phone: DEMO_PHONE, role });

    await createUser('Quản trị viên MediCare', 'admin@medicare.vn', ROLES.ADMIN);
    const doctorMinhAnh = await createUser('BS. Nguyễn Minh Anh', 'doctor@medicare.vn', ROLES.DOCTOR);
    const patientLan = await createUser('Trần Thị Lan', 'patient@medicare.vn', ROLES.PATIENT);
    const doctorQuocBao = await createUser('BS. Trần Quốc Bảo', 'bao@medicare.vn', ROLES.DOCTOR);
    await createUser('Lê Văn Nam', 'nam@medicare.vn', ROLES.PATIENT);

    const hanoiHospital = await insert(connection, 'facilities', {
      name: 'Bệnh viện MediCare Hà Nội',
      address: '12 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
      phone: '024 3999 8888',
    });
    const caugiayClinic = await insert(connection, 'facilities', {
      name: 'Phòng khám MediCare Cầu Giấy',
      address: '25 Xuân Thủy, Cầu Giấy, Hà Nội',
      phone: '024 3888 7777',
    });

    const specialtyIds = [];
    for (const name of ['Tim mạch', 'Nhi khoa', 'Da liễu', 'Tai Mũi Họng', 'Cơ xương khớp']) {
      specialtyIds.push(
        await insert(connection, 'specialties', {
          name,
          description: `Khám và tư vấn chuyên sâu ${name.toLowerCase()}.`,
        }),
      );
    }

    const cardiologist = {
      user_id: doctorMinhAnh,
      specialty_id: specialtyIds[0],
      facility_id: hanoiHospital,
      degree: 'Thạc sĩ, Bác sĩ',
      experience: '12 năm',
      bio: 'Chuyên khám và điều trị các bệnh lý tim mạch, tư vấn chăm sóc sức khỏe chủ động.',
      fee: 300000,
      work_days: 'T2,T3,T4,T5,T6',
      start_time: '08:00',
      end_time: '17:00',
    };
    const cardiologistId = await insert(connection, 'doctors', cardiologist);
    await insert(connection, 'doctors', {
      user_id: doctorQuocBao,
      specialty_id: specialtyIds[1],
      facility_id: caugiayClinic,
      degree: 'Bác sĩ chuyên khoa I',
      experience: '9 năm',
      bio: 'Tận tâm trong khám và điều trị các bệnh thường gặp ở trẻ em.',
      fee: 250000,
      work_days: 'T2,T3,T4,T5,T6,T7',
      start_time: '08:00',
      end_time: '16:30',
    });

    await insert(connection, 'appointments', {
      patient_id: patientLan,
      doctor_id: cardiologistId,
      appointment_date: nextWorkingDate(cardiologist.work_days),
      start_time: '09:00',
      reason: 'Khám sức khỏe định kỳ',
      fee: cardiologist.fee,
      payment_method: PAYMENT_METHODS.SIMULATED,
      payment_status: PAYMENT_STATUS.PAID,
      status: APPOINTMENT_STATUS.PENDING,
    });

    console.log(`Seed thành công. Tài khoản demo dùng mật khẩu ${DEMO_PASSWORD}.`);
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
