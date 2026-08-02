package com.swp.horseracing.dto;

import lombok.Data;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Đăng nhập
    // [Tác dụng]: Hứng username và password từ form Đăng nhập của người dùng gửi lên.
    // [Hướng dẫn sửa đổi]:
    // - Data: Nếu đổi phương thức đăng nhập (ví dụ: login bằng email), hãy sửa thuộc tính `username` thành `email`.
public class LoginRequestDTO {
    private String email;
    private String password;
}