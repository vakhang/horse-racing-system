package com.swp.horseracing.service.impl;

import com.swp.horseracing.dto.HorseRequestDTO;
import com.swp.horseracing.dto.HorseResponseDTO;
import com.swp.horseracing.model.Horse;
import com.swp.horseracing.model.HorseAttachment;
import com.swp.horseracing.model.HorseDocType;
import com.swp.horseracing.model.HorseStatus;
import com.swp.horseracing.model.User;
import com.swp.horseracing.repository.HorseRepository;
import com.swp.horseracing.repository.UserRepository;
import com.swp.horseracing.service.FileStorageService;
import com.swp.horseracing.service.HorseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
    // [Chức năng rõ ràng]: Class Triển khai Logic Ngựa
    // [Tác dụng]: Kiểm tra nghiệp vụ (file đính kèm hợp lệ không) trước khi lưu ngựa mới vào Database.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Nếu muốn tự động Reject ngựa của tài khoản đang bị Ban, hãy check status Chủ ngựa trước.
public class HorseServiceImpl implements HorseService {

    private final HorseRepository horseRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public HorseResponseDTO createHorse(HorseRequestDTO request) {
        if (request.getMicrochipCode() == null || request.getMicrochipCode().trim().isEmpty()) {
            throw new RuntimeException("Bắt buộc phải nhập mã Microchip!");
        }
        if (request.getCertFiles() == null || request.getCertFiles().isEmpty() ||
            request.getRealImageFiles() == null || request.getRealImageFiles().isEmpty() ||
            request.getVetRecordFiles() == null || request.getVetRecordFiles().isEmpty()) {
            throw new RuntimeException("Bắt buộc phải tải lên đầy đủ 3 loại hồ sơ (Ảnh thực tế, Giấy chứng nhận, Sổ khám bệnh)!");
        }

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Chủ ngựa với ID: " + request.getOwnerId()));

        Horse horse = Horse.builder()
                .name(request.getName())
                .owner(owner)
                .age(request.getAge())
                .breed(request.getBreed())
                .color(request.getColor())
                .status(request.getStatus() != null ? request.getStatus() : HorseStatus.PENDING)
                .microchipCode(request.getMicrochipCode())
                .lastHealthCheck(request.getLastHealthCheck())
                .attachments(new ArrayList<>())
                .build();

        saveAttachments(horse, request);
        return mapToResponseDTO(horseRepository.save(horse));
    }

    @Override
    public List<HorseResponseDTO> getAllHorses() {
        return horseRepository.findAll().stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<HorseResponseDTO> getHorsesByOwnerId(Integer ownerId) {
        return horseRepository.findByOwnerId(ownerId).stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public HorseResponseDTO getHorseById(Integer id) {
        Horse horse = horseRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy Ngựa!"));
        return mapToResponseDTO(horse);
    }

    @Override
    @Transactional
    public HorseResponseDTO updateHorse(Integer id, HorseRequestDTO request) {
        Horse horse = horseRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy Ngựa!"));

        if (request.getOwnerId() != null && !horse.getOwner().getId().equals(request.getOwnerId())) {
            User newOwner = userRepository.findById(request.getOwnerId()).orElseThrow();
            horse.setOwner(newOwner);
        }

        if (request.getName() != null) horse.setName(request.getName());
        if (request.getAge() != null) horse.setAge(request.getAge());
        if (request.getBreed() != null) horse.setBreed(request.getBreed());
        if (request.getColor() != null) horse.setColor(request.getColor());
        if (request.getStatus() != null) horse.setStatus(request.getStatus());
        if (request.getMicrochipCode() != null) horse.setMicrochipCode(request.getMicrochipCode());
        if (request.getLastHealthCheck() != null) horse.setLastHealthCheck(request.getLastHealthCheck());

        saveAttachments(horse, request);
        return mapToResponseDTO(horseRepository.save(horse));
    }

    @Override
    @Transactional
    public void deleteHorse(Integer id) {
        if (!horseRepository.existsById(id)) throw new RuntimeException("Không tìm thấy Ngựa với ID: " + id);
        horseRepository.deleteById(id);
    }

    private void saveAttachments(Horse horse, HorseRequestDTO request) {
        String safeName = horse.getName() != null ? horse.getName().replaceAll("\\s+", "_") : "Unknown";
        String ownerName = horse.getOwner() != null ? horse.getOwner().getUsername().replaceAll("\\s+", "") : "Owner";
        String folder = "horses/" + ownerName + "_" + safeName;

        if (request.getCertFiles() != null) {
            for (MultipartFile file : request.getCertFiles()) {
                String url = fileStorageService.storeFile(file, folder);
                if (url != null) horse.getAttachments().add(HorseAttachment.builder().horse(horse).docType(HorseDocType.CERTIFICATE).fileUrl(url).build());
            }
        }
        if (request.getRealImageFiles() != null) {
            for (MultipartFile file : request.getRealImageFiles()) {
                String url = fileStorageService.storeFile(file, folder);
                if (url != null) horse.getAttachments().add(HorseAttachment.builder().horse(horse).docType(HorseDocType.REAL_IMAGE).fileUrl(url).build());
            }
        }
        if (request.getVetRecordFiles() != null) {
            for (MultipartFile file : request.getVetRecordFiles()) {
                String url = fileStorageService.storeFile(file, folder);
                if (url != null) horse.getAttachments().add(HorseAttachment.builder().horse(horse).docType(HorseDocType.VET_RECORD).fileUrl(url).build());
            }
        }
    }

    private HorseResponseDTO mapToResponseDTO(Horse horse) {
        Float winRate = 0f;
        if (horse.getTotalRaces() != null && horse.getTotalRaces() > 0) {
            int wins = horse.getWinRaces() != null ? horse.getWinRaces() : 0;
            winRate = (float) wins / horse.getTotalRaces() * 100;
        }

        List<String> certs = new ArrayList<>();
        List<String> reals = new ArrayList<>();
        List<String> vets = new ArrayList<>();

        if (horse.getAttachments() != null) {
            for (HorseAttachment a : horse.getAttachments()) {
                if (a.getDocType() == HorseDocType.CERTIFICATE) certs.add(a.getFileUrl());
                if (a.getDocType() == HorseDocType.REAL_IMAGE) reals.add(a.getFileUrl());
                if (a.getDocType() == HorseDocType.VET_RECORD) vets.add(a.getFileUrl());
            }
        }

        return HorseResponseDTO.builder()
                .id(horse.getId())
                .name(horse.getName())
                .ownerId(horse.getOwner() != null ? horse.getOwner().getId() : null)
                .ownerUsername(horse.getOwner() != null ? horse.getOwner().getUsername() : null)
                .age(horse.getAge())
                .breed(horse.getBreed())
                .color(horse.getColor())
                .certDocumentUrls(certs)
                .realImageUrls(reals)
                .vetRecordUrls(vets)
                .status(horse.getStatus() != null ? horse.getStatus() : com.swp.horseracing.model.HorseStatus.PENDING)
                .totalRaces(horse.getTotalRaces())
                .winRaces(horse.getWinRaces())
                .winRate(winRate)
                .healthStatus(horse.getHealthStatus())
                .microchipCode(horse.getMicrochipCode())
                .lastHealthCheck(horse.getLastHealthCheck())
                .build();
    }
}