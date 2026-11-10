/** Thông báo toàn trang cho các trạng thái đang tải, lỗi hoặc không có dữ liệu. */
export default function PageMessage({ children, role }) {
  return (
    <main className="section wrap">
      <div className="empty-state" role={role}>
        {children}
      </div>
    </main>
  );
}
