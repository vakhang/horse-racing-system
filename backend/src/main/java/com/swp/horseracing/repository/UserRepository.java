package com.swp.horseracing.repository;

import com.swp.horseracing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

    // [Chức năng rõ ràng]: Interface kết nối DB (User)
    // [Tác dụng]: Thao tác bảng `users`. Chứa nhiều hàm quan trọng: Đăng nhập (findByUsername), kiểm tra trùng (existsByUsername), tìm kiếm theo Role.
    // [Hướng dẫn sửa đổi]:
    // - Data: Khi thêm form Quên mật khẩu, phải thêm hàm `findByEmail` vào đây.
public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    // TÌM USER BẰNG EMAIL HOẶC SỐ ĐIỆN THOẠI
    Optional<User> findByEmailOrPhoneNumber(String email, String phoneNumber);

    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByIdNumber(String idNumber);

    java.util.List<User> findByRole(com.swp.horseracing.model.RoleEnum role);
}
