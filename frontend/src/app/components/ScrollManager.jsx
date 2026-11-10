import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Cuộn tới phần tử theo #hash, hoặc về đầu trang khi chuyển trang. */
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo(0, 0);
  }, [pathname, hash, key]);

  return null;
}
