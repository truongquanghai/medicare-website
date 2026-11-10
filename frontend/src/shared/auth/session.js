const TOKEN_KEY = 'medicare_token';
const USER_KEY = 'medicare_user';

// localStorage có thể bị chặn (chế độ riêng tư, chính sách trình duyệt) nên mọi truy cập đều được bảo vệ.
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* bỏ qua: phiên chỉ tồn tại đến khi tải lại trang */
  }
};

const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* bỏ qua */
  }
};

export const getToken = () => read(TOKEN_KEY);

export function getStoredUser() {
  if (!getToken()) return null;
  try {
    return JSON.parse(read(USER_KEY));
  } catch {
    return null;
  }
}

export const saveUser = (user) => write(USER_KEY, JSON.stringify(user));

export function saveSession({ token, user }) {
  write(TOKEN_KEY, token);
  saveUser(user);
}

export function clearSession() {
  remove(TOKEN_KEY);
  remove(USER_KEY);
}
