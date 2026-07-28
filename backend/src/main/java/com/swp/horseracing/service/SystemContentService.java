package com.swp.horseracing.service;

import com.swp.horseracing.dto.SystemContentDTO;

import java.util.List;

public interface SystemContentService {
    SystemContentDTO getContentByPageId(String pageId);
    SystemContentDTO updateContent(String pageId, SystemContentDTO request);
    List<SystemContentDTO> getAllContents();
}
