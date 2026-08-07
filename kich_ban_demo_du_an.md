# 📋 KỊCH BẢN DEMO BẢO VỆ ĐỒ ÁN: HỆ THỐNG ĐUA NGỰA & CÁ CƯỢC THỂ THAO (BET989)

> **Mục tiêu**: Trình bày toàn bộ luồng nghiệp vụ khép kín từ khâu chuẩn bị, đăng ký, bốc thăm thực địa, cân nài bù chì, đặt cược Pari-mutuel đến trả thưởng tự động và kiểm toán tài chính 100% Total Pool trước Thầy/Cô.

---

## 🎬 PHA 1: CHUẨN BỊ GIẢI ĐẤU & ĐĂNG KÝ THI ĐẤU (5 Phút)

### 📍 Bước 1: Admin Duyệt Ngựa & Kỵ Sĩ (KYC)
- **Hành động**: Đăng nhập tài khoản **Admin**.
- **Thao tác**:
  1. Vào **Quản Lý Kỵ Sĩ**: Bấm `Duyệt KYC` cho Nài ngựa (Trần Rồng).
  2. Vào **Duyệt Chiến Mã**: Duyệt chiến mã cho Chủ ngựa, hệ thống tự động cấp mốc khởi điểm **Class 4 - Rating 40 pts**.
- **Điểm nhấn thuyết minh với Giáo viên**: 
  > *"Chiến mã mới tham gia giải được xếp vào Class 4 với Rating sàn 40 pts, đây là cơ sở để hệ thống tính Tải trọng gánh quy chuẩn (Handicap) ở các bước sau."*

### 📍 Bước 2: Admin Tạo Chặng Đua & Phân Công Trọng Tài
- **Hành động**: Admin vào **Quản Lý Giải Đấu & Chặng Đua**.
- **Thao tác**:
  1. Tạo Chặng đua mới: *"Chặng Khởi Động Class 4"*.
  2. Thiết lập Giải thưởng cố định: Prize 1 = 100.000.000đ, Prize 2 = 50.000.000đ, Prize 3 = 25.000.000đ.
  3. Phân công Trọng tài phụ trách chặng (`Referee`).

### 📍 Bước 3: Chủ Ngựa Đăng Ký & Nài Ngựa Chấp Nhận Lời Mời
- **Hành động**: 
  1. Đăng nhập tài khoản **Chủ Ngựa** -> Đăng ký chiến mã vào Chặng đua -> Gửi lời mời cho Nài ngựa (Trần Rồng).
  2. Đăng nhập tài khoản **Nài Ngựa (Trần Rồng)** -> Vào **Lời Mời Thi Đấu** -> Bấm `CHẤP NHẬN`.
- **Điểm nhấn thuyết minh**: 
  > *"Hệ thống kiểm soát ràng buộc độc quyền: Một Nài ngựa không thể nhận cõng 2 con ngựa trong cùng 1 chặng đua. Nếu chặng đua mở kèo cược mà đơn đăng ký chưa có Nài chấp nhận, hệ thống sẽ tự động hủy đơn lỗi."*

---

## 🎲 PHA 2: MỞ KÈO CƯỢC & THAO TÁC CỦA KHÁN GIẢ (5 Phút)

### 📍 Bước 4: Kiểm Soát Phân Quyền Bảo Mật (Ràng Buộc Nội Bộ)
- **Hành động**: Đăng nhập thử tài khoản **Nài Ngựa** hoặc **Chủ Ngựa** -> Thử truy cập trang `/betting`.
- **Kết quả**: Màn hình hiển thị cảnh báo đỏ **"TRUY CẬP BỊ TỪ CHỐI - Tài khoản Nài/Chủ ngựa không được phép tham gia cá cược"**.
- **Điểm nhấn thuyết minh**: 
  > *"Tính minh bạch thể thao: Hệ thống chặn tuyệt đối kỵ sĩ, chủ ngựa và trọng tài tham gia đặt cược nhằm chống gian lận và dàn xếp tỷ số."*

### 📍 Bước 5: Khán Giả Đặt Cược Pari-Mutuel & Kiểm Soát Hạn Mức Ngày
- **Hành động**: Đăng nhập tài khoản **Khán Giả**.
- **Thao tác**:
  1. Mở **Bảng Kèo Cá Cược**: Cho Thầy/Cô xem 4 tab thể loại cược (**Win, Place, Quinella, Exacta**).
  2. **Thao tác cược Win**: Chọn Ngựa A -> Nhập 500.000đ -> Bấm `CHỐT VÉ CƯỢC`.
  3. **Thao tác cược Place**: Chuyển sang tab Place -> Chọn Ngựa B -> Nhập 500.000đ -> Bấm `CHỐT VÉ CƯỢC`.
  4. **Thử nghiệm Hạn Mức Ngày**: Cược thêm 100.000đ (Tổng cược trong ngày vượt 1.000.000đ).
- **Kết quả**: Hệ thống lập tức báo lỗi: **"Bạn đã vượt quá hạn mức cược tối đa 1.000.000 VNĐ/ngày!"**.
- **Điểm nhấn thuyết minh**:
  > *"Bảng cược sử dụng cơ chế Pari-mutuel: Tỷ lệ Odds Live của tab Win (65% pool) và tab Place (32.5% pool per rank) biến đổi riêng biệt theo thời gian thực dựa trên tổng tiền dồn vào từng con ngựa."*

---

## ⚖️ PHA 3: NGHIỆP VỤ THỰC ĐỊA TRỌNG TÀI (5 Phút)

### 📍 Bước 6: Xác Nhận Cổng Xuất Phát (Gate #) & Cân Nài Bù Chì
- **Hành động**: Đăng nhập tài khoản **Trọng Tài** -> Mở Modal `📋 CỔNG XUẤT PHÁT & ⚖️ CÂN NÀI`.
- **Thao tác**:
  1. **Xác nhận Cổng xuất phát**: Chọn số Cổng xuất phát (`Cổng #1`, `Cổng #2`...) sau khi bốc thăm thực địa bên ngoài.
  2. **Cân Nài thực tế**:
     - Với Nài 1: Nhập cân thực tế `48.0 kg` (Nhẹ hơn Tải chỉ định `52.1 kg`).
     - Hệ thống tự động tính toán và hiện badge cam: **`+4.1 kg chì lá ⚖️`**.
     - Với Nài 2: Nhập cân thực tế `55.0 kg` (Nặng hơn 52.1 kg) -> Hệ thống hiện badge xanh: **`Đủ tải trọng`**.
  3. Trọng tài bấm **`⚖️ XÁC NHẬN CÂN`** cho từng cặp Nài - Ngựa.

### 📍 Bước 7: Khóa Cược & Phát Lệnh Bắt Đầu Đua
- **Hành động**: Trọng tài nhấn nút **`BẮT ĐẦU ĐUA`**.
- **Kết quả**: Chặng đua chuyển sang trạng thái **`RUNNING`**. Bảng cược của Khán giả tự động khóa lại.

---

## 🏆 PHA 4: KẾT THÚC CHẶNG & TỰ ĐỘNG PAYOUT TRẢ THƯỞNG (3 Phút)

### 📍 Bước 8: Trọng Tài Nhập Kết Quả & Chốt Payout
- **Hành động**: Trọng tài nhập Hạng 1 (Winner), Hạng 2 (Second), Hạng 3 và thời gian chạy (giây) -> Bấm **`XÁC NHẬN KẾT QUẢ`** (`RESULT_CONFIRMED`).
- **Kết quả**: Backend tự động kích hoạt tiến trình Payout trong vài giây:
  1. **Trả thưởng Khán giả trúng cược**: Tiền thưởng = Tiền cược × Odds. Tự động khấu trừ 10% thuế TNCN cho phần lãi > 10 triệu.
  2. **Thưởng Chủ ngựa Top 1**: Cộng 5% Total Pool + 70% Prize 1 vào Ví Chủ.
  3. **Thưởng Nài ngựa Top 1**: Cộng 2% Total Pool + 30% Prize 1 vào Ví Nài.

---

## 🏛️ PHA 5: BÁO CÁO TÀI CHÍNH & KIỂM TOÁN HỆ THỐNG (2 Phút)

### 📍 Bước 9: Trình Bày Bảng Phân Bổ Dòng Tiền 100% Total Pool
- **Hành động**: Đăng nhập **Admin** -> Vào **Quản Lý Tài Chính & Quỹ**.
- **Thuyết minh sơ đồ tài chính với Thầy/Cô**:
  - **Quỹ Trả Thưởng Khán Giả (65%)**: Trả đủ 100% cho người chơi trúng cược.
  - **Doanh Thu Nhà Cái (35% GGR)**:
    - 👑 **Thưởng Chủ Ngựa Top 1**: 5% Total Pool.
    - 🏇 **Thưởng Nài Ngựa Top 1**: 2% Total Pool.
    - 💼 **Doanh Thu Ròng Thực Tế Nhà Cái (Net GGR)**: 28% Total Pool ($35\% - 5\% - 2\%$).
  - **Kiểm toán tuyệt đối**: $100\% = 65\% + 5\% + 2\% + 28\%$.
  - **Exacta Jackpot Carryover**: Cho xem số dư Quỹ dồn Exacta của từng Class trong bảng System Funds.

---

## 💡 CÁC CÂU HỎI PHẢN BIỆN THƯỜNG GẶP CỦA GIÁO VIÊN & CÁCH TRẢ LỜI:

1. **❓ Hỏi**: *"Nếu kỵ sĩ mập lên tăng 10kg thì các con ngựa khác có phải gánh thêm chì không?"*
   - **💡 Đáp**: *"Dạ không. Tải chỉ định của mỗi ngựa được tính độc lập theo điểm Rating của chính nó. Nài ngựa mập lên thì bản thân con ngựa đó chịu bất lợi gánh nặng, các ngựa khác hoàn toàn không bị ảnh hưởng."*

2. **❓ Hỏi**: *"Tại sao Odds của cược Win và cược Place lại khác nhau?"*
   - **💡 Đáp**: *"Hệ thống áp dụng mô hình Bể Cược Độc Lập (Independent Bet Pools). Bể Win sử dụng 65% tổng cược Win để chia cho ngựa Hạng 1. Bể Place sử dụng 65% tổng cược Place chia đôi thành 2 phần 32.5% độc lập cho Hạng 1 và Hạng 2."*

3. **❓ Hỏi**: *"Nếu không có ai cược trúng cược Exacta thì tiền cược đi đâu?"*
   - **💡 Đáp**: *"65% quỹ cược Exacta sẽ không bị nhà cái thu mất mà được lưu giữ lại làm Jackpot Carryover theo Cấp chạy (Class) trong Database, và tự động cộng dồn vào bể cược Exacta của chặng đua cùng Class tiếp theo."*
