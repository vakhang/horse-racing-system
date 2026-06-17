package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.HorseRequestDTO;
import com.swp.horseracing.dto.HorseResponseDTO;
import com.swp.horseracing.model.Horse;
import com.swp.horseracing.model.HorseStatus;
import com.swp.horseracing.model.User;
import com.swp.horseracing.repository.HorseRepository;
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.service.HorseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HorseServiceImpl implements HorseService {

    private final HorseRepository horseRepository;
    private final UserRepository userRepository; // Tiêm vào để check Chủ ngựa

    @Override
    @Transactional
    public HorseResponseDTO createHorse(HorseRequestDTO request) {
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chủ ngựa với ID: " + request.getOwnerId()));

        Horse horse = Horse.builder()
                .name(request.getName())
                .owner(owner)
                .age(request.getAge())
                // Đã thay healthStatus và winRate bằng breed và color
                .breed(request.getBreed())
                .color(request.getColor())
                .documentUrl(request.getDocumentUrl())
                .status(request.getStatus() != null ? request.getStatus() : HorseStatus.PENDING)
                .build();

        return mapToResponseDTO(horseRepository.save(horse));
    }

    @Override
    public List<HorseResponseDTO> getAllHorses() {
        return horseRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HorseResponseDTO> getHorsesByOwnerId(Integer ownerId) {
        return horseRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HorseResponseDTO getHorseById(Integer id) {
        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Ngựa với ID: " + id));
        return mapToResponseDTO(horse);
    }

    @Override
    @Transactional
    public HorseResponseDTO updateHorse(Integer id, HorseRequestDTO request) {
        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Ngựa với ID: " + id));

        if (request.getOwnerId() != null && !horse.getOwner().getId().equals(request.getOwnerId())) {
            User newOwner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Chủ ngựa mới với ID: " + request.getOwnerId()));
            horse.setOwner(newOwner);
        }

        if (request.getName() != null) horse.setName(request.getName());
        if (request.getAge() != null) horse.setAge(request.getAge());

        // Cập nhật theo thuộc tính mới
        if (request.getBreed() != null) horse.setBreed(request.getBreed());
        if (request.getColor() != null) horse.setColor(request.getColor());

        if (request.getDocumentUrl() != null) horse.setDocumentUrl(request.getDocumentUrl());
        if (request.getStatus() != null) horse.setStatus(request.getStatus());

        return mapToResponseDTO(horseRepository.save(horse));
    }

    @Override
    @Transactional
    public void deleteHorse(Integer id) {
        if (!horseRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Ngựa với ID: " + id);
        }
        horseRepository.deleteById(id);
    }

    private HorseResponseDTO mapToResponseDTO(Horse horse) {
        Float winRate = 0f;
        if (horse.getTotalRaces() != null && horse.getTotalRaces() > 0) {
            winRate = (float) horse.getWinRaces() / horse.getTotalRaces() * 100;
        }

        return HorseResponseDTO.builder()
                .id(horse.getId())
                .name(horse.getName())
                .ownerId(horse.getOwner() != null ? horse.getOwner().getId() : null)
                .ownerUsername(horse.getOwner() != null ? horse.getOwner().getUsername() : null)
                .age(horse.getAge())
                .breed(horse.getBreed())
                .color(horse.getColor())
                .documentUrl(horse.getDocumentUrl())
                .status(horse.getStatus())
                .totalRaces(horse.getTotalRaces())
                .winRaces(horse.getWinRaces())
                .winRate(winRate)
                .healthStatus(horse.getHealthStatus())
                .build();
    }
}