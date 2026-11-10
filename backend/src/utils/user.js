import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

export const comparePassword = (password, hash) => bcrypt.compare(password, hash);

export const PUBLIC_USER_COLUMNS = 'id, full_name, email, phone, role';

export const toPublicUser = ({ id, full_name, email, phone, role }) => ({ id, full_name, email, phone, role });
