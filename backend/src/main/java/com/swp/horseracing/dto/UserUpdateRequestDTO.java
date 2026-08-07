
package com.swp.horseracing.dto;

import com.swp.horseracing.model.RoleEnum;
import com.swp.horseracing.model.UserStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
    // [Chức năng rõ ràng]: Lớp DTO nhận Request Sửa User
    // [Tác dụng]: Hứng thông tin text khi User muốn đổi avatar, mật khẩu hoặc cập nhật họ tên.
    // [Hướng dẫn sửa đổi]:
    // - Data: Nếu thêm form liên kết ngân hàng, hãy thêm biến nhận `bankNumber`.
public class UserUpdateRequestDTO {
    private String username;
    private RoleEnum role;
    private LocalDate dob;
    private java.util.List<org.springframework.web.multipart.MultipartFile> kycFiles;
    private UserStatus status;
    private String phoneNumber;
    private Double weight;
    private Double height;
    private java.util.List<org.springframework.web.multipart.MultipartFile> certFiles;
    private java.util.List<org.springframework.web.multipart.MultipartFile> healthFiles;
    private org.springframework.web.multipart.MultipartFile avatarFile;
}