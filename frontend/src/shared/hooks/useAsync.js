import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Chạy một hàm bất đồng bộ khi mount và mỗi khi `asyncFn` đổi.
 * `asyncFn` phải ổn định (hàm ở cấp module hoặc bọc bằng useCallback).
 * Trong lúc tải lại, `data` giữ giá trị cũ để giao diện không bị nháy.
 */
export function useAsync(asyncFn) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState({ request: null, data: null, error: null });

  const request = useMemo(() => ({ asyncFn, reloadCount }), [asyncFn, reloadCount]);

  useEffect(() => {
    let ignore = false;

    asyncFn()
      .then((data) => {
        if (!ignore) setResult({ request, data, error: null });
      })
      .catch((error) => {
        if (!ignore) setResult({ request, data: null, error });
      });

    return () => {
      ignore = true;
    };
  }, [asyncFn, request]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { data: result.data, error: result.error, loading: result.request !== request, reload };
}
