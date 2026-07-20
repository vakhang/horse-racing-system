package com.swp.horseracing.service.impl;

import com.swp.horseracing.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
public class FileStorageServiceImpl implements FileStorageService {
    private final Path fileStorageLocation;
    private final List<String> ALLOWED_EXTENSIONS = Arrays.asList("pdf", "png", "jpg", "jpeg", "zip", "rar", "heic");

    public FileStorageServiceImpl() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Không thể tạo thư mục gốc lưu file.", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        return storeFile(file, "general"); // Mặc định vào folder general
    }

    @Override
    public String storeFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) return null;
        String originalName = org.springframework.util.StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String ext = originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(ext)) throw new RuntimeException("Định dạng file không hỗ trợ: " + ext);

        String fileName = UUID.randomUUID().toString() + "." + ext;
        try {
            // Tạo thư mục con nếu chưa tồn tại
            Path targetFolder = this.fileStorageLocation.resolve(subFolder);
            Files.createDirectories(targetFolder);

            Path targetLocation = targetFolder.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "http://localhost:8080/uploads/" + subFolder + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Lưu file thất bại " + fileName, ex);
        }
    }

    @Override
    public List<String> storeFiles(List<MultipartFile> files) {
        return storeFiles(files, "general");
    }

    @Override
    public List<String> storeFiles(List<MultipartFile> files, String subFolder) {
        List<String> urls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                String url = storeFile(file, subFolder);
                if (url != null) urls.add(url);
            }
        }
        return urls;
    }
}