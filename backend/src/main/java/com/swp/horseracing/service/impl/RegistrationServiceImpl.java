package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.RegistrationRequestDTO;
import com.swp.horseracing.dto.RegistrationResponseDTO;
import com.swp.horseracing.model.*;
import com.swp.horseracing.repository.*;
import com.swp.horseracing.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final RaceRepository raceRepository;
    private final HorseRepository horseRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public RegistrationResponseDTO createRegistration(RegistrationRequestDTO request) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chặng đua ID: " + request.getRaceId()));
        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Ngựa ID: " + request.getHorseId()));
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chủ ngựa ID: " + request.getOwnerId()));

        User jockey = null;
        if (request.getJockeyId() != null) {
            jockey = userRepository.findById(request.getJockeyId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Nài ngựa ID: " + request.getJockeyId()));
        }

        Registration registration = Registration.builder()
                .race(race)
                .horse(horse)
                .owner(owner)
                .jockey(jockey)
                // ĐÃ XÓA odds Ở ĐÂY VÌ ĐƠN ĐĂNG KÝ KHÔNG CÒN DÍNH DÁNG TỚI TỶ LỆ CƯỢC NỮA
                .status(request.getStatus() != null ? request.getStatus() : RegistrationStatus.WAITING_JOCKEY)
                .note(request.getNote())
                .build();

        return mapToResponseDTO(registrationRepository.save(registration));
    }

    @Override
    public List<RegistrationResponseDTO> getAllRegistrations() {
        return registrationRepository.findAll().stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<RegistrationResponseDTO> getRegistrationsByRaceId(Integer raceId) {
        return registrationRepository.findByRaceId(raceId).stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<RegistrationResponseDTO> getRegistrationsByOwnerId(Integer ownerId) {
        return registrationRepository.findByOwnerId(ownerId).stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<RegistrationResponseDTO> getRegistrationsByJockeyId(Integer jockeyId) {
        return registrationRepository.findByJockeyId(jockeyId).stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public RegistrationResponseDTO getRegistrationById(Integer id) {
        Registration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Đơn đăng ký ID: " + id));
        return mapToResponseDTO(reg);
    }

    @Override
    @Transactional
    public RegistrationResponseDTO updateRegistration(Integer id, RegistrationRequestDTO request) {
        Registration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Đơn đăng ký ID: " + id));

        if (request.getJockeyId() != null) {
            User jockey = userRepository.findById(request.getJockeyId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Nài ngựa ID: " + request.getJockeyId()));
            reg.setJockey(jockey);
        }

        // ĐÃ XÓA LỆNH CẬP NHẬT odds Ở ĐÂY
        if (request.getStatus() != null) reg.setStatus(request.getStatus());
        if (request.getNote() != null) reg.setNote(request.getNote());

        return mapToResponseDTO(registrationRepository.save(reg));
    }

    @Override
    @Transactional
    public void deleteRegistration(Integer id) {
        if (!registrationRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Đơn đăng ký ID: " + id);
        }
        registrationRepository.deleteById(id);
    }

    private RegistrationResponseDTO mapToResponseDTO(Registration reg) {
        return RegistrationResponseDTO.builder()
                .id(reg.getId())
                .raceId(reg.getRace() != null ? reg.getRace().getId() : null)
                .raceName(reg.getRace() != null ? reg.getRace().getName() : null)
                .horseId(reg.getHorse() != null ? reg.getHorse().getId() : null)
                .horseName(reg.getHorse() != null ? reg.getHorse().getName() : null)
                .ownerId(reg.getOwner() != null ? reg.getOwner().getId() : null)
                .ownerUsername(reg.getOwner() != null ? reg.getOwner().getUsername() : null)
                .jockeyId(reg.getJockey() != null ? reg.getJockey().getId() : null)
                .jockeyUsername(reg.getJockey() != null ? reg.getJockey().getUsername() : null)
                // ĐÃ XÓA TRẢ VỀ odds Ở ĐÂY
                .status(reg.getStatus())
                .note(reg.getNote())
                .build();
    }
}