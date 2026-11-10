import 'dotenv/config';

const PLACEHOLDER_SECRET = 'replace_this_with_a_long_random_secret';
const MIN_PRODUCTION_SECRET_LENGTH = 32;

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('Thiếu biến môi trường JWT_SECRET. Hãy sao chép .env.example thành .env và điền giá trị.');
}

if (isProduction && (jwtSecret === PLACEHOLDER_SECRET || jwtSecret.length < MIN_PRODUCTION_SECRET_LENGTH)) {
  throw new Error(`JWT_SECRET trong môi trường production phải là chuỗi ngẫu nhiên dài tối thiểu ${MIN_PRODUCTION_SECRET_LENGTH} ký tự.`);
}

export const env = Object.freeze({
  isProduction,
  port: Number(process.env.PORT) || 4000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret,
  db: Object.freeze({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'medicare',
  }),
});
