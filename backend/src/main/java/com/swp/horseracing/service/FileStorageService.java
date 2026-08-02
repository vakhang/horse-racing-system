package com.swp.horseracing.service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

    // [Chức năng rõ ràng]: Interface Service Lưu trữ File
    // [Tác dụng]: Định nghĩa hàm upload file (ảnh, video) lên Cloudinary.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm hàm xóa file khỏi Cloudinary.
public interface FileStorageService {
    String storeFile(MultipartFile file);
    String storeFile(MultipartFile file, String subFolder); // Bổ sung hàm có thư mục con
    List<String> storeFiles(List<MultipartFile> files);
    List<String> storeFiles(List<MultipartFile> files, String subFolder);
}