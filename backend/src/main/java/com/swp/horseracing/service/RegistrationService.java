package com.swp.horseracing.service;

import com.swp.horseracing.dto.RegistrationRequestDTO;
import com.swp.horseracing.dto.RegistrationResponseDTO;
import java.util.List;

    // [Chức năng rõ ràng]: Interface Service Đăng ký Thi đấu
    // [Tác dụng]: Định nghĩa hàm đăng ký suất chạy cho ngựa và nài.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm hàm rút lui khỏi chặng đua.
public interface RegistrationService {
    RegistrationResponseDTO createRegistration(RegistrationRequestDTO request);
    List<RegistrationResponseDTO> getAllRegistrations();
    List<RegistrationResponseDTO> getRegistrationsByRaceId(Integer raceId);
    List<RegistrationResponseDTO> getRegistrationsByOwnerId(Integer ownerId);
    List<RegistrationResponseDTO> getRegistrationsByJockeyId(Integer jockeyId);
    RegistrationResponseDTO getRegistrationById(Integer id);
    RegistrationResponseDTO updateRegistration(Integer id, RegistrationRequestDTO request);
    void deleteRegistration(Integer id);
}