# MediCare – Website đặt lịch khám bệnh

Stack: React 18 + Vite, Node.js + Express, MySQL 8.

## 1. Yêu cầu
- Node.js 20+
- MySQL 8+ (hoặc MariaDB tương thích)

## 2. Cài đặt
Tạo database và các bảng (chạy từ thư mục gốc dự án):
```bash
mysql -u root -p --default-character-set=utf8mb4 < backend/schema.sql
```

Backend:
```bash
cd backend
cp .env.example .env      # rồi điền thông tin MySQL và JWT_SECRET
npm install
npm run seed              # tạo dữ liệu demo (xóa dữ liệu cũ, không chạy được ở production)
npm run dev
```

Frontend (terminal khác):
```bash
cd frontend
cp .env.example .env      # tùy chọn: chỉ cần khi API không chạy ở http://localhost:4000/api
npm install
npm run dev
```
Mở http://localhost:5173

## 3. Tài khoản demo
Mật khẩu của mọi tài khoản demo: `123456`.
- Admin: `admin@medicare.vn`
- Bác sĩ: `doctor@medicare.vn`, `bao@medicare.vn`
- Bệnh nhân: `patient@medicare.vn`, `nam@medicare.vn`

## 4. Luồng trình diễn
1. Bệnh nhân tìm bác sĩ, chọn ngày và khung giờ còn trống để đặt lịch; có thể hủy lịch đang chờ/đã xác nhận.
2. Bác sĩ xác nhận, từ chối rồi hoàn thành lịch khám của mình.
3. Admin xem thống kê, theo dõi mọi lịch hẹn và quản lý dữ liệu qua API `/api/admin/*`.

## 5. Cấu trúc
```
backend/src
  config/        biến môi trường, kết nối DB, cấu hình bảng cho CRUD admin
  constants/     vai trò, trạng thái lịch khám, quy tắc chuyển trạng thái
  controllers/   xử lý nghiệp vụ theo từng nhóm API
  middleware/    xác thực JWT, phân quyền, kiểm tra dữ liệu, xử lý lỗi
  routes/        khai báo endpoint và rule kiểm tra đầu vào
  services/      logic dùng chung (tính khung giờ trống)
  utils/         hàm tiện ích thuần (lịch làm việc, mật khẩu, lỗi HTTP)
backend/tests    kiểm thử đơn vị (npm test)

frontend/src
  app/           App, layout, route bảo vệ, AuthProvider
  features/      auth, home, doctors, appointments, dashboard, account
  shared/        API client, hook, hằng số, tiện ích và component dùng chung
  styles/        CSS chia theo base / layout / components / pages
```

## 6. API chính
| Method | Đường dẫn | Mô tả |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | Đăng ký (vai trò bệnh nhân) / đăng nhập |
| GET, PATCH | `/api/auth/me`, `/api/auth/profile` | Xem / cập nhật hồ sơ |
| GET | `/api/specialties`, `/api/facilities` | Danh mục |
| GET | `/api/doctors`, `/api/doctors/:id` | Danh sách (hỗ trợ `q`, `specialty`) / chi tiết |
| GET | `/api/doctors/:id/slots?date=YYYY-MM-DD` | Khung giờ khám và trạng thái còn trống |
| GET, POST | `/api/appointments` | Lịch khám của tôi (admin: tất cả) / đặt lịch (bệnh nhân) |
| PATCH | `/api/appointments/:id/status` | Đổi trạng thái theo quy tắc từng vai trò |
| GET | `/api/admin/stats` | Thống kê (admin) |
| GET, POST, PUT, DELETE | `/api/admin/:table[/:id]` | CRUD `users`, `specialties`, `facilities`, `doctors` (admin) |

## 7. Lưu ý kỹ thuật
- Khung khám 30 phút, tính theo giờ Việt Nam; không đặt được giờ đã qua, ngoài giờ làm việc hoặc ngày bác sĩ nghỉ.
- Chống trùng giờ ở backend bằng kiểm tra khung trống và unique constraint theo bác sĩ/ngày/giờ (lịch đã hủy hoặc bị từ chối giải phóng khung giờ).
- Thanh toán là mô phỏng: chọn "Thanh toán mô phỏng" thì lịch ở trạng thái đã thanh toán, "Thanh toán tại cơ sở" thì chưa thanh toán.
- Khi admin tạo tài khoản qua API phải cung cấp `password` (6–72 ký tự); không còn mật khẩu mặc định.
- Chạy production: đặt `NODE_ENV=production` và `JWT_SECRET` ngẫu nhiên tối thiểu 32 ký tự.
- Kiểm tra mã: `npm run lint` (cả backend và frontend), `npm test` (backend), `npm run build` (frontend).
