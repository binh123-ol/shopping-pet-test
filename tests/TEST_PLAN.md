# Kế hoạch Kiểm thử Hệ thống Shopping Pet (Selenium WebDriver)

Tài liệu này chi tiết 15 kịch bản kiểm thử cho mỗi chức năng trong 4 chức năng cốt lõi.

---

## 1. Chức năng: Đăng ký (Register)
1. **TC_REG_01**: Đăng ký thành công với thông tin hợp lệ.
2. **TC_REG_02**: Đăng ký thất bại khi để trống tất cả các trường.
3. **TC_REG_03**: Đăng ký thất bại với email đã tồn tại.
4. **TC_REG_04**: Đăng ký thất bại khi nhập email sai định dạng (thiếu @, .com).
5. **TC_REG_05**: Đăng ký thất bại khi mật khẩu quá ngắn (dưới 6 ký tự).
6. **TC_REG_06**: Đăng ký thất bại khi để trống tên người dùng.
7. **TC_REG_07**: Đăng ký thành công với email có khoảng trắng ở đầu/cuối (trim).
8. **TC_REG_08**: Kiểm tra nút "Đăng nhập" dẫn về trang login.html.
9. **TC_REG_09**: Kiểm tra thông báo thành công hiển thị đúng nội dung.
10. **TC_REG_10**: Tự động chuyển hướng sang trang Login sau khi đăng ký thành công.
11. **TC_REG_11**: Đăng ký với tên người dùng rất dài (Kiểm tra giới hạn hiển thị).
12. **TC_REG_12**: Đăng ký với email chứa ký tự đặc biệt hợp lệ (ví dụ: test+alias@gmail.com).
13. **TC_REG_13**: Kiểm tra nút Đăng ký có bị vô hiệu hóa sau khi click để tránh gửi dữ liệu nhiều lần.
14. **TC_REG_14**: Kiểm tra quay lại trang chủ từ trang đăng ký qua Logo.
15. **TC_REG_15**: Đăng ký với mật khẩu chứa toàn khoảng trắng (nếu hệ thống chặn).

---

## 2. Chức năng: Đăng nhập (Login)
1. **TC_LOG_01**: Đăng nhập thành công với tài khoản User.
2. **TC_LOG_02**: Đăng nhập thành công với tài khoản Admin.
3. **TC_LOG_03**: Đăng nhập thất bại khi sai mật khẩu.
4. **TC_LOG_04**: Đăng nhập thất bại với email không tồn tại.
5. **TC_LOG_05**: Đăng nhập thất bại khi để trống email.
6. **TC_LOG_06**: Đăng nhập thất bại khi để trống mật khẩu.
7. **TC_LOG_07**: Đăng nhập thất bại khi email sai định dạng.
8. **TC_LOG_08**: Kiểm tra Token được lưu vào LocalStorage sau khi đăng nhập.
9. **TC_LOG_09**: Kiểm tra nút "Đăng ký" dẫn về trang register.html.
10. **TC_LOG_10**: Kiểm tra trạng thái đăng nhập được duy trì sau khi tải lại trang (F5).
11. **TC_LOG_11**: Đăng xuất thành công và xóa Token khỏi LocalStorage.
12. **TC_LOG_12**: Đăng nhập với Email viết hoa (Kiểm tra không phân biệt chữ hoa thường).
13. **TC_LOG_13**: Truy cập trực tiếp trang Login khi đã đăng nhập (Nên chuyển hướng về trang chủ).
14. **TC_LOG_14**: Kiểm tra hiển thị tên người dùng trên Header sau khi đăng nhập.
15. **TC_LOG_15**: Kiểm tra các liên kết hỗ trợ hoặc thông tin liên hệ ở chân trang Login.

---

## 3. Chức năng: Thêm vào giỏ hàng (Add to Cart)
1. **TC_CRT_01**: Thêm sản phẩm thành công từ trang chủ.
2. **TC_CRT_02**: Kiểm tra Badge giỏ hàng tăng lên khi thêm sản phẩm.
3. **TC_CRT_03**: Thêm sản phẩm từ trang chi tiết sản phẩm.
4. **TC_CRT_04**: Thêm nhiều sản phẩm khác nhau vào giỏ hàng.
5. **TC_CRT_05**: Thêm cùng một sản phẩm nhiều lần (số lượng tăng trong giỏ).
6. **TC_CRT_06**: Thêm sản phẩm khi chưa đăng nhập (yêu cầu đăng nhập).
7. **TC_CRT_07**: Kiểm tra sản phẩm trong giỏ hàng khớp với sản phẩm đã chọn (tên, giá).
8. **TC_CRT_08**: Badge giỏ hàng cập nhật ngay lập tức mà không cần tải lại trang.
9. **TC_CRT_09**: Thêm sản phẩm sau khi tìm kiếm theo từ khóa.
10. **TC_CRT_10**: Thêm sản phẩm sau khi lọc theo danh mục.
11. **TC_CRT_11**: Quay lại trang chi tiết sản phẩm từ tên sản phẩm trong giỏ hàng.
12. **TC_CRT_12**: Kiểm tra giỏ hàng vẫn lưu thông tin sau khi đăng xuất rồi đăng nhập lại.
13. **TC_CRT_13**: Thêm sản phẩm có giá trị lớn (Kiểm tra hiển thị tiền).
14. **TC_CRT_14**: Thêm sản phẩm và kiểm tra tổng tiền giỏ hàng (Subtotal).
15. **TC_CRT_15**: Kiểm tra thông báo khi thêm thành công (nếu có Toast message).

---

## 4. Chức năng: Đặt hàng (Order)
1. **TC_ORD_01**: Đặt hàng thành công với đầy đủ thông tin (COD).
2. **TC_ORD_02**: Đặt hàng thất bại khi thiếu Số điện thoại.
3. **TC_ORD_03**: Đặt hàng thất bại khi thiếu Địa chỉ giao hàng.
4. **TC_ORD_04**: Đặt hàng thất bại khi thiếu Họ tên người nhận.
5. **TC_ORD_05**: Kiểm tra tổng tiền đơn hàng khớp với giỏ hàng.
6. **TC_ORD_06**: Tự động chuyển hướng về "Lịch sử đơn hàng" sau khi đặt thành công.
7. **TC_ORD_07**: Kiểm tra đơn hàng mới xuất hiện trong danh sách lịch sử.
8. **TC_ORD_08**: Trạng thái đơn hàng mới mặc định là "Pending".
9. **TC_ORD_09**: Xem chi tiết đơn hàng vừa đặt qua Modal.
10. **TC_ORD_10**: Đặt hàng thành công với đơn hàng có nhiều sản phẩm.
11. **TC_ORD_11**: Đặt hàng với số điện thoại sai định dạng (chứa chữ cái).
12. **TC_ORD_12**: Kiểm tra giỏ hàng bị xóa sạch sau khi đặt hàng thành công.
13. **TC_ORD_13**: Kiểm tra thông tin địa chỉ lưu đúng trong chi tiết đơn hàng.
14. **TC_ORD_14**: Kiểm tra nút quay lại giỏ hàng từ trang Thanh toán.
15. **TC_ORD_15**: Kiểm tra hiển thị ngày đặt hàng chính xác trong lịch sử.
