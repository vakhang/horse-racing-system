package com.swp.horseracing.service;

import com.swp.horseracing.dto.SystemContentDTO;

import java.util.List;

    // [Chức năng rõ ràng]: Interface Service Nội dung Tĩnh
    // [Tác dụng]: Định nghĩa hàm lấy và cập nhật bài viết HTML.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Khai báo thêm hàm xóa bài viết.
public interface SystemContentService {
    SystemContentDTO getContentByPageId(String pageId);
    SystemContentDTO updateContent(String pageId, SystemContentDTO request);
    List<SystemContentDTO> getAllContents();
}
