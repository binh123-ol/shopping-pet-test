# Hướng dẫn chạy kiểm thử tự động với Selenium WebDriver

Dự án này sử dụng **Selenium WebDriver**, **Mocha** và **Chai** để thực hiện kiểm thử tự động cho hệ thống Shopping Pet.

## 1. Yêu cầu hệ thống
- **Node.js**: Đã cài đặt trên máy.
- **Google Chrome**: Phiên bản mới nhất.
- **ChromeDriver**: Sẽ được cài đặt tự động qua `npm install`.

## 2. Thiết lập môi trường
Trước khi chạy test, hãy đảm bảo bạn đã cài đặt các thư viện cần thiết trong thư mục `tests/`:
```bash
cd tests
npm install
```

## 3. Khởi chạy hệ thống (Backend & Frontend)
Đảm bảo cả Backend và Frontend đều đang chạy:
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://127.0.0.1:5500`

Đừng quên chạy script seed để có dữ liệu mẫu:
```bash
cd backend
npm run seed
```

## 4. Chạy kiểm thử
Để chạy toàn bộ 10 test cases, thực hiện lệnh sau trong thư mục `tests/`:
```bash
npm test
```

## 5. Danh sách 10 Test Cases
1.  **TC01: Đăng ký tài khoản mới thành công** - Kiểm tra luồng đăng ký người dùng mới.
2.  **TC02: Đăng nhập thành công** - Kiểm tra đăng nhập với thông tin đúng.
3.  **TC03: Đăng nhập thất bại** - Kiểm tra thông báo lỗi khi sai mật khẩu.
4.  **TC04: Tìm kiếm sản phẩm** - Kiểm tra chức năng tìm kiếm trên trang chủ.
5.  **TC05: Lọc sản phẩm theo danh mục** - Kiểm tra việc lọc sản phẩm theo loại thú cưng.
6.  **TC06: Xem chi tiết sản phẩm** - Kiểm tra việc điều hướng đến trang chi tiết.
7.  **TC07: Thêm sản phẩm vào giỏ hàng** - Kiểm tra badge giỏ hàng tăng lên khi thêm.
8.  **TC08: Quản lý giỏ hàng** - Kiểm tra việc xóa sản phẩm khỏi giỏ hàng.
9.  **TC09: Đặt hàng thành công** - Kiểm tra luồng thanh toán và tạo đơn hàng.
10. **TC10: Xem lịch sử đơn hàng** - Kiểm tra đơn hàng mới xuất hiện trong danh sách.

## Lưu ý về Headless Mode
Hiện tại mã nguồn test đang để ở chế độ **Headless** (không mở trình duyệt thật) để chạy nhanh và tiết kiệm tài nguyên. Nếu bạn muốn xem trình duyệt chạy trực tiếp, hãy xóa dòng `options.addArguments('--headless');` trong file `shopping_pet_test.js`.
