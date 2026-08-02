package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.SystemContentDTO;
import com.swp.horseracing.model.SystemContent;
import com.swp.horseracing.repository.SystemContentRepository;
import com.swp.horseracing.service.SystemContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
    // [Chức năng rõ ràng]: Class Triển khai Nội dung CMS
    // [Tác dụng]: Tìm bài viết theo PageId (LUAT_CHOI, DIEU_KHOAN), nếu chưa có thì tạo mới, nếu có rồi thì update nội dung HTML.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm hệ thống Cache (Redis) ở đây để không phải chọc vào DB liên tục khi Frontend get bài viết.
public class SystemContentServiceImpl implements SystemContentService {

    private final SystemContentRepository systemContentRepository;

    @Override
    public SystemContentDTO getContentByPageId(String pageId) {
        SystemContent content = systemContentRepository.findByPageId(pageId)
                .orElseGet(() -> {
                    // Create default if not exists
                    SystemContent newContent = SystemContent.builder()
                            .pageId(pageId)
                            .title(pageId)
                            .content("Nội dung đang được cập nhật...")
                            .build();
                    return systemContentRepository.save(newContent);
                });
        return mapToDTO(content);
    }

    @Override
    public SystemContentDTO updateContent(String pageId, SystemContentDTO request) {
        SystemContent content = systemContentRepository.findByPageId(pageId)
                .orElseGet(() -> SystemContent.builder().pageId(pageId).build());

        content.setTitle(request.getTitle());
        content.setContent(request.getContent());

        SystemContent updated = systemContentRepository.save(content);
        return mapToDTO(updated);
    }

    @Override
    public List<SystemContentDTO> getAllContents() {
        return systemContentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SystemContentDTO mapToDTO(SystemContent content) {
        return SystemContentDTO.builder()
                .id(content.getId())
                .pageId(content.getPageId())
                .title(content.getTitle())
                .content(content.getContent())
                .updatedAt(content.getUpdatedAt())
                .build();
    }
}
