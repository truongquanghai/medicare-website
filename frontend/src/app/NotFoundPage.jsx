import { Link } from 'react-router-dom';
import { ROUTES } from '../shared/constants/routes';

export default function NotFoundPage() {
  return (
    <section className="section wrap center-text">
      <h1>404 – Không tìm thấy trang</h1>
      <p className="muted">Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển.</p>
      <Link className="btn btn-primary" to={ROUTES.home}>
        Về trang chủ
      </Link>
    </section>
  );
}
