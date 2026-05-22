package com.swp.horseracing.controller;

import com.swp.horseracing.dto.RegistrationRequestDTO;
import com.swp.horseracing.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<?> createRegistration(@RequestBody RegistrationRequestDTO request) {
        try {
            return ResponseEntity.ok(registrationService.createRegistration(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getRegistrations(
            @RequestParam(required = false) Integer raceId,
            @RequestParam(required = false) Integer ownerId,
            @RequestParam(required = false) Integer jockeyId) {

        if (raceId != null) return ResponseEntity.ok(registrationService.getRegistrationsByRaceId(raceId));
        if (ownerId != null) return ResponseEntity.ok(registrationService.getRegistrationsByOwnerId(ownerId));
        if (jockeyId != null) return ResponseEntity.ok(registrationService.getRegistrationsByJockeyId(jockeyId));

        return ResponseEntity.ok(registrationService.getAllRegistrations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRegistrationById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(registrationService.getRegistrationById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRegistration(@PathVariable Integer id, @RequestBody RegistrationRequestDTO request) {
        try {
            return ResponseEntity.ok(registrationService.updateRegistration(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRegistration(@PathVariable Integer id) {
        try {
            registrationService.deleteRegistration(id);
            return ResponseEntity.ok("Xóa Đơn đăng ký thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}