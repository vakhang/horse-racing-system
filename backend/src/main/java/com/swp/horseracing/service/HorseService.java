package com.swp.horseracing.service;

import com.swp.horseracing.dto.HorseRequestDTO;
import com.swp.horseracing.dto.HorseResponseDTO;
import java.util.List;

    // [Chức năng rõ ràng]: Interface Service Quản lý Ngựa
    // [Tác dụng]: Định nghĩa các hàm CRUD ngựa, duyệt ngựa cho Admin/Chủ ngựa.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Khai báo thêm hàm tìm kiếm ngựa theo độ tuổi.
public interface HorseService {
    HorseResponseDTO createHorse(HorseRequestDTO request);
    List<HorseResponseDTO> getAllHorses();
    List<HorseResponseDTO> getHorsesByOwnerId(Integer ownerId);
    HorseResponseDTO getHorseById(Integer id);
    HorseResponseDTO updateHorse(Integer id, HorseRequestDTO request);
    void deleteHorse(Integer id);
}