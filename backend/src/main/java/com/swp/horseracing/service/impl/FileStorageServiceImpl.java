package com.swp.horseracing.service.impl;

import com.cloudinary.Cloudinary;
import com.swp.horseracing.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
    // [Chức năng rõ ràng]: Class Triển khai Upload File
    // [Tác dụng]: Kết nối trực tiếp với SDK của Cloudinary để upload file Multipart, trả về đường link ảnh an toàn (Secure URL).
    // [Hướng dẫn sửa đổi]:
    // - Logic: Đổi Folder lưu trữ trên Cloudinary (Ví dụ: `horse_racing_dev`) tại biến cấu hình.
public class FileStorageServiceImpl implements FileStorageService {

    private final Cloudinary cloudinary;

    // Các định dạng file cho phép
    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "pdf", "zip");

    @Override
    public String storeFile(MultipartFile file) {
        return storeFile(file, "general");
    }

    @Override
    public String storeFile(MultipartFile file, String subFolder) {
        if (file.isEmpty())
            return null;
        String originalName = org.springframework.util.StringUtils
                .cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String ext = originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(ext))
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Định dạng file không được hỗ trợ: " + ext);

        try {
            // ĐÃ SỬA LỖI BÁO ĐỎ Ở ĐÂY: Sử dụng java.util.Map.of() an toàn kiểu
            Map<String, Object> uploadParams = Map.of(
                    "folder", "uploads/" + subFolder,
                    "resource_type", "auto" // Tự động nhận diện định dạng (ảnh, pdf, zip)
            );

            // Đẩy trực tiếp mảng bytes của file lên Cloudinary
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            // Lấy URL trả về (dùng secure_url để luôn lấy link chuẩn https://...)
            return uploadResult.get("secure_url").toString();

        } catch (IOException ex) {
            throw new RuntimeException("Lưu file lên Cloudinary thất bại!", ex);
        }
    }

    @Override
    public List<String> storeFiles(List<MultipartFile> files) {
        return storeFiles(files, "general");
    }

    @Override
    public List<String> storeFiles(List<MultipartFile> files, String subFolder) {
        List<String> fileUrls = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                String url = storeFile(file, subFolder);
                if (url != null) {
                    fileUrls.add(url);
                }
            }
        }
        return fileUrls;
    }
}
