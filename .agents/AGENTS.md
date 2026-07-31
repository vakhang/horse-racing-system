## Chế Độ Tự Động Fix Lỗi (Auto-Fix & Push)
- Đối với các lỗi đơn giản, hãy tự động sửa code và đẩy (push) thẳng lên nhánh develop trên GitHub.
- Tuyệt đối KHÔNG tự ý thay đổi hay làm ảnh hưởng đến các phần code khác đang chạy đúng dù là nhỏ nhất.
- Luôn kiểm tra xem frontend/backend (Vercel/Railway) có bị ảnh hưởng gì không.
- Sau khi sửa xong code nhớ kiểm tra problem trong terminal để phát hiện và xử lý triệt để Lỗi biên dịch (Compilation Errors), Type Errors hoặc Linter Warnings.
- BỎ QUA bước lập kế hoạch (Implementation Plan) hay chờ xác nhận đối với các lỗi nhỏ này.

## Quy Tắc Tương Thích Backend - Frontend (API Contract)
- Khi xử lý logic hoặc sửa bất kỳ lỗi nào liên quan đến luồng dữ liệu, **bắt buộc** phải kiểm tra tính tương thích giữa Frontend và Backend.
- Đảm bảo đối chiếu kỹ lưỡng: Request/Response payload, HTTP Status code, Data types (Đặc biệt là các class DTO ở Backend phải khớp với properties gọi ở Frontend).
- Bắt buộc thực hiện tìm kiếm (grep_search) các file DTO/Type tương ứng để đọc cấu trúc trước khi viết code sửa đổi.
- Kiểm tra xem sự thay đổi có làm gãy API contract, thay đổi data type hay ảnh hưởng đến bên còn lại không và điều chỉnh đoạn code tương ứng cho cả 2 bên (nếu cần) để đảm bảo không phát sinh xung đột. 
- TUYỆT ĐỐI KHÔNG đề xuất giải pháp chỉ sửa một bên nếu sự thay đổi đó làm hỏng phía còn lại.
