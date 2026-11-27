# Role

Bạn là một Senior Full-stack Developer chuyên về kiến trúc hệ thống và bảo mật ứng dụng web.

# Task

<!-- Hãy viết bộ cấu hình Docker hoàn chỉnh cho môi trường Production (và gợi ý cấu hình Development nếu cần) cho dự án của tôi. -->

project-root/
├── frontend/ # React SPA (Vite) + TypeScript + TailwindCSS
├── backend/ # Node.js + Express + TypeScript
├── docker-compose.yml # File điều phối tổng ở thư mục gốc
└── .env.example # Mẫu biến môi trường tổng

# Tech Stack

- **Frontend:** React + Vite, TypeScript, TailwindCSS, Zustand, Axios, react-router-dom, Zod
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

##### Backend

### 1. Yêu cầu Database & Schema (MongoDB / Mongoose)

- Tạo hoặc cập nhật `Product` model (`models/product.model.ts`) với các trường tiêu chuẩn thương mại điện tử:
  - `name` (String, required), `slug` (String, unique, indexed), `description` (String), `price` (Number), `originalPrice` (Number), `discountPercentage` (Number), `images` (Array of Strings), `category` (ObjectId ref Category), `brand` (String), `stock` (Number), `soldCount` (Number, default 0), `rating` (Number, default 0), `reviewCount` (Number, default 0), `specifications` (Map hoặc Array `{ key: String, value: String }`), `variants` (Array `{ name: String, options: Array<{ label: String, priceAdjustment: Number, stock: Number }> }`), `isActive` (Boolean, default true).
- **Indexing:** Thiết lập Text Index trên `name`, `brand`, `description` và Compound Index trên `{ isActive: 1, price: 1, soldCount: -1 }` để tối ưu tốc độ truy vấn tìm kiếm.

### 2. Yêu cầu API Endpoints & Logic xử lý

`product.controller.ts`, `product.service.ts` và `product.route.ts`:

#### A. API Tìm kiếm sản phẩm: `GET /api/products/search`

- **Query Params:**
  - `q` (string): Từ khóa tìm kiếm (bắt buộc hoặc trả về danh sách mặc định nếu rỗng, cần sanitize chống ReDoS).
  - `page` (number, default: 1) & `limit` (number, default: 10).
  - `sort` (enum: `relevance` | `newest` | `bestselling` | `price_asc` | `price_desc`).
- **Logic tìm kiếm:**
  - Hỗ trợ tìm kiếm kết hợp MongoDB `$text` search (tính `textScore` để xếp hạng độ liên quan) hoặc regex không phân biệt hoa thường cho từ khóa ngắn/tiếng Việt có dấu & không dấu.
  - Chỉ trả về các trường cần thiết cho thẻ sản phẩm (Projection: `_id`, `name`, `slug`, `price`, `originalPrice`, `discountPercentage`, `images` [chỉ lấy ảnh đầu tiên], `soldCount`, `rating`, `location`) để giảm tải payload.
  - Trả về cấu trúc chuẩn: `{ success: true, data: products, pagination: { page, limit, totalItems, totalPages } }`.

#### B. API Chi tiết sản phẩm: `GET /api/products/:slug`

- **Logic xử lý:**
  - Hỗ trợ tìm kiếm linh hoạt theo `slug` (ưu tiên chuẩn SEO) hoặc `_id` (nếu chuỗi truyền vào là Valid ObjectId).
  - Populate thông tin `category` (chỉ lấy `name`, `slug`).
  - Nếu sản phẩm không tồn tại hoặc `isActive: false`, ném lỗi `404 Not Found` qua custom `AppError` middleware.
  - Trả về đầy đủ thông tin sản phẩm bao gồm toàn bộ `images`, `description`, `specifications`, `variants`, `stock`, `soldCount`, `rating`.

### 3. Tối ưu hiệu năng & Bảo mật

- Áp dụng **Cache-Aside pattern với `ioredis`**:
  - Cache kết quả tìm kiếm phổ biến với key dạng `search:products:<hash_query_params>` (TTL: 300s).
  - Cache chi tiết sản phẩm với key `product:detail:<slugOrId>` (TTL: 600s).
- Validate toàn bộ `req.query` và `req.params` bằng **Zod**.
- Viết code sạch, tách biệt rõ ràng giữa Route -> Validation Middleware -> Controller -> Service -> Model.

##### Frontend

### 1. Types & API Service (`types/product.ts` & `services/product.service.ts`)

- Định nghĩa interface `ProductCardItem` (cho danh sách tìm kiếm) và `ProductDetail` (kế thừa và mở rộng đầy đủ thông tin chi tiết).
- Cấu hình Axios instance gọi tới:
  - `searchProducts(params: SearchQueryParams)`: gọi `GET /api/products/search`.
  - `getProductDetail(slugOrId: string)`: gọi `GET /api/products/${slugOrId}`.

### 2. Trang Kết Quả Tìm Kiếm (`/search` hoặc `SearchResultsPage.tsx`)

- **Đồng bộ URL Search Params:** Đọc từ khóa `q`, `page`, `sort`, `minPrice`, `maxPrice` trực tiếp từ URL để người dùng có thể F5 hoặc chia sẻ link mà không mất trạng thái tìm kiếm.
- **Giao diện (UI/UX phong cách sàn TMĐT hiện đại):**
  - **Header kết quả:** Hiển thị dòng thông báo `Kết quả tìm kiếm cho từ khóa "<từ khóa>"` kèm tổng số sản phẩm tìm thấy.
  - **Thanh sắp xếp (Sort Bar):** Các nút chuyển nhanh: _Liên quan_, _Mới nhất_, _Bán chạy_, và Dropdown chọn _Giá: Thấp đến Cao / Cao đến Thấp_.
  - **Product Grid:** Responsive grid (`grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3`).
  - **Component `ProductCard`:**
    - Hiển thị ảnh tỷ lệ vuông (`aspect-square object-cover`), badge giảm giá góc phải trên, tên sản phẩm giới hạn 2 dòng (`line-clamp-2`), giá bán nổi bật, giá gốc gạch ngang, đánh giá sao (FontAwesome) và số lượng đã bán.
    - **Tương tác Click:** Toàn bộ thẻ sản phẩm là một `<Link>` (hoặc `onClick` điều hướng) dẫn tới trang chi tiết `/product/[slug]` (kèm fallback `_id`). Có hiệu ứng hover nhẹ (`hover:-translate-y-0.5 hover:shadow-md transition`).
  - **Trạng thái tải & Rỗng:**
    - Hiển thị **Skeleton Loading** dạng lưới thẻ sản phẩm trong lúc đang fetch API.
    - Hiển thị **Empty State** trực quan (icon tìm kiếm + gợi ý kiểm tra chính tả/từ khóa chung chung hơn) khi không có sản phẩm nào khớp.
  - **Phân trang (Pagination):** Nút chuyển trang mượt mà và tự động cuộn lên đầu trang (`window.scrollTo({ top: 0, behavior: 'smooth' })`) khi đổi trang.

### 3. Trang Chi Tiết Sản Phẩm (`/product/[slug]` hoặc `ProductDetailPage.tsx`)

- Lấy `slug` từ URL params, gọi `getProductDetail(slug)` và hiển thị đầy đủ:
  - **Breadcrumb:** `Trang chủ > Danh mục > Tên sản phẩm`.
  - **Cột trái (Gallery):** Ảnh chính kích thước lớn + danh sách ảnh nhỏ (thumbnails) bên dưới, click hoặc hover thumbnail sẽ đổi ảnh chính.
  - **Cột phải (Thông tin & Mua hàng):**
    - Tên sản phẩm, số sao đánh giá, số lượng đã bán.
    - Khung giá nổi bật (giá bán, giá gốc, % giảm giá).
    - **Bộ chọn phân loại hàng (Variants):** Render các nút chọn (Màu sắc, Kích thước...) cập nhật giá và tồn kho tương ứng.
    - **Bộ chọn số lượng:** Nút `-` / `+` giới hạn không vượt quá `stock` hiện có.
    - Nút **Thêm vào giỏ hàng** (kết nối với Zustand cart store) và **Mua ngay**.
  - **Phần dưới:** Bảng **Thông số kỹ thuật** (`specifications`) và khung **Mô tả chi tiết sản phẩm** (`description`).
  - Xử lý đầy đủ Skeleton loading khi đang tải dữ liệu và trang báo lỗi 404 thân thiện nếu không tìm thấy sản phẩm.
