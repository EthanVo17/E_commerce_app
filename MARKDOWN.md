# Role

Bạn là một Senior Full-stack Developer chuyên về kiến trúc hệ thống và bảo mật ứng dụng web.

# Task

Hãy viết bộ cấu hình Docker hoàn chỉnh cho môi trường Production (và gợi ý cấu hình Development nếu cần) cho dự án của tôi.

project-root/
├── frontend/ # React SPA (Vite) + TypeScript + TailwindCSS
├── backend/ # Node.js + Express + TypeScript
├── docker-compose.yml # File điều phối tổng ở thư mục gốc
└── .env.example # Mẫu biến môi trường tổng

# Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS, Zustand, Axios, [React Hook Form + Zod]
- **Backend:** Node.js + Express, TypeScript
- **Database & Cache:** MongoDB (Mongoose), Redis
- **Cơ chế xác thực:** JWT (Access Token + Refresh Token lưu trong HttpOnly Cookie)

# Rules

- Đã có giao diện sẵn nên đừng chỉnh sửa quá nhiều về giao diện.
- Cấm tự ý sửa schema database, migration hoặc hardcode API key, secret, thông tin nhạy cảm.
- Chỉ sửa đúng phần được giao, không tự refactor lan sang file hoặc tính năng không liên quan; chia nhỏ task thay vì giao một cục lớn.
- Viết code phải refector, không nên đưa hết code vào một file. Chia nhỏ file code.
- Bắt buộc viết unit test/kiểm tra lỗi sau khi sửa code, không tự kết luận "đã xong" nếu chưa chạy kiểm chứng

# Requirements

## 1. Quản lý trạng thái xác thực toàn cục (Auth Store)

- Tạo `useAuthStore` (Zustand) lưu trữ:
  - `user`: Thông tin cơ bản (`id`, `fullName`, `email`, `phoneNumber`, `avatarUrl`, `role`) hoặc `null`.
  - `accessToken`: Lưu trong bộ nhớ ứng dụng (RAM), không lưu vào `localStorage`.
  - `isAuthenticated`: Boolean xác định trạng thái đăng nhập.
  - `isInitializing`: Boolean (mặc định `true`) để tránh hiện tượng nhấp nháy giao diện (UI flickering) hiển thị nhầm nút Login trong lúc app đang kiểm tra phiên đăng nhập khi vừa tải lại trang.
- Cung cấp các actions: `setAuth(user, accessToken)`, `logout()`, và `initializeAuth()` (gọi `/api/auth/refresh` hoặc `/api/users/me` ngay khi app khởi chạy để khôi phục phiên từ HttpOnly Cookie).

## 2. Điều hướng sau khi đăng nhập thành công (Post-Login Redirect)

- **Lưu trữ trang đích trước đó (`from` / `callbackUrl`):** Nếu người dùng bị chặn ở một trang riêng tư (ví dụ: `/profile`, `/orders`) và bị đẩy sang `/login`, sau khi đăng nhập thành công hãy điều hướng họ quay lại đúng trang đó; nếu truy cập trực tiếp `/login`, điều hướng về Trang chủ (`/`).
- **Chặn truy cập ngược (Guest Route Guard):** Bọc các trang `/login`, `/signup` bằng component `GuestRoute` — nếu `isAuthenticated === true`, tự động chuyển hướng về `/` để người dùng đã đăng nhập không thể vào lại trang đăng nhập.
- Hiển thị thông báo chào mừng (Toast notification, ví dụ: _"Đăng nhập thành công! Chào mừng [Tên user]"_).

## 3. Cập nhật giao diện Navbar / Header

- **Khi chưa đăng nhập (`!isAuthenticated`):** Hiển thị 2 nút hành động rõ ràng là **Đăng nhập** (viền/ghost) và **Đăng ký** (nút chính nổi bật).
- **Khi đang kiểm tra phiên (`isInitializing`):** Hiển thị khung xương tải trang (Skeleton circle) kích thước tương đương Avatar để giữ bố cục Header không bị giật (Layout Shift).
- **Khi đã đăng nhập (`isAuthenticated`):**
  - Ẩn hoàn toàn cụm nút Đăng nhập / Đăng ký.
  - Hiển thị **Avatar người dùng** (nếu `avatarUrl` trống, tự động tạo Avatar chữ cái đầu từ `fullName`, ví dụ: _"Võ Tấn Đạt"_ -> `VĐ` trên nền màu hài hòa) kèm tên rút gọn trên màn hình Desktop.
  - Khi click vào Avatar, mở **User Dropdown Menu** (hỗ trợ đóng khi click ra ngoài hoặc nhấn phím `Esc`) gồm các mục:
    - Thông tin tóm tắt tài khoản (Tên + Email hoặc Số điện thoại).
    - Link điều hướng: _Hồ sơ cá nhân (`/profile`)_, _Cài đặt tài khoản (`/settings`)_.
    - Nút **Đăng xuất (Logout)**: Gọi API `/api/auth/logout` (để server xóa HttpOnly Cookie và thu hồi Refresh Token), gọi `logout()` trên store để xóa state ở client, và điều hướng về `/` hoặc `/login`.

# Output Format

1. Code chi tiết cho `useAuthStore` (bao gồm cơ chế `initializeAuth` chống nhấp nháy UI khi F5).
2. Code chi tiết cho `Navbar` / `Header` và component `UserAvatarDropdown` (responsive cho cả Desktop và Mobile).
3. Code chi tiết cho `GuestRoute` / `ProtectedRoute` và logic redirect trong `LoginForm`.
