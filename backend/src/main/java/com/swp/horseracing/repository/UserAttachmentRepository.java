package com.swp.horseracing.repository;

import com.swp.horseracing.model.UserAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
    // [Chức năng rõ ràng]: Interface kết nối DB (UserAttachment)
    // [Tác dụng]: Thao tác bảng `user_attachments`. Hỗ trợ lấy toàn bộ file đính kèm của một User cụ thể.
    // [Hướng dẫn sửa đổi]:
    // - Data: Thêm hàm lấy file theo `UserDocType` nếu chỉ muốn lấy riêng biệt từng loại (VD: Chỉ lấy CCCD, không lấy Avatar).
public interface UserAttachmentRepository extends JpaRepository<UserAttachment, Integer> {
    java.util.List<UserAttachment> findByUserId(Integer userId);
}
