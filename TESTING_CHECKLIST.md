# Checklist Kiểm Thử Hệ Thống (QA)

Dưới đây là các bước test trọng tâm để đảm bảo luồng nghiệp vụ hoạt động chính xác:

## 1. Test Login (Auth)
- [ ] Admin đăng nhập thành công, nhận JWT token và chuyển hướng về `/admin`.
- [ ] Agent đăng nhập thành công, nhận JWT token và chuyển hướng về `/agent`.
- [ ] Xử lý lỗi khi sai email/password (hiển thị thông báo hợp lệ).
- [ ] Truy cập các route yêu cầu quyền bị chặn nếu token hết hạn hoặc sai Role.

## 2. Test Tạo Sản Phẩm (Admin)
- [ ] Chỉ Admin gọi được API POST `/api/products`.
- [ ] Input đủ `retailPrice` và `basePrice`.
- [ ] KẾT QUẢ ĐÚNG: DB tự lấy `commission = retailPrice - basePrice`.
- [ ] KẾT QUẢ ĐÚNG: DB tự lấy `point = commission / 10000`.

## 3. Test Tạo Đơn Hàng (Agent)
- [ ] Agent gọi API tạo đơn thành công cho khách hàng, gửi kèm danh sách `productId` và `quantity`.
- [ ] KẾT QUẢ ĐÚNG: Đơn hàng mới có `status` là `pending`.
- [ ] KẾT QUẢ ĐÚNG: Hệ thống tự trích xuất giá từ DB, tính chuẩn `totalAmount`, `commission`, và `point` lưu vào đơn.

## 4. Test Duyệt Đơn (Admin)
- [ ] Admin xem được danh sách toàn bộ đơn hàng.
- [ ] Admin có thể cập nhật `status` của đơn (từ `pending` sang `approved`, `shipping`, `cancelled`).
- [ ] Đại lý lúc này kiểm tra ví: Cả `totalRevenue` và `totalPoint` vẫn chưa thay đổi.

## 5. Test Cộng Commission và Point
- [ ] Admin cập nhật `status` đơn hàng sang `completed`.
- [ ] KẾT QUẢ ĐÚNG: Profile của Đại lý (Agent) nhận đơn đó phải tăng `totalRevenue` (cộng bằng đúng commission của đơn).
- [ ] KẾT QUẢ ĐÚNG: Profile của Đại lý phải tăng `totalPoint` (cộng bằng đúng point của đơn).
- [ ] (Edge Case): Thử hoàn tác đơn hoặc huỷ (`cancelled`) -> Tiền và điểm không bị cộng sai.
