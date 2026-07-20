package com.swp.horseracing.service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface FileStorageService {
    String storeFile(MultipartFile file);
    String storeFile(MultipartFile file, String subFolder); // Bổ sung hàm có thư mục con
    List<String> storeFiles(List<MultipartFile> files);
    List<String> storeFiles(List<MultipartFile> files, String subFolder);
}