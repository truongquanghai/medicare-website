import { useCallback, useState } from 'react';

const THEME_KEY = 'medicare_theme';

/** Giao diện sáng/tối. Giá trị ban đầu do script trong index.html đặt trên thẻ <html>. */
export function useTheme() {
  const [theme, setTheme] = useState(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* bỏ qua: lựa chọn chỉ có hiệu lực đến khi tải lại trang */
    }
    setTheme(next);
  }, [theme]);

  return { theme, toggleTheme };
}
