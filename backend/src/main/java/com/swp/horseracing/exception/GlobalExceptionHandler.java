package com.swp.horseracing.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Tóm tất cả các lỗi RuntimeException trong hệ thống
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", e.getMessage());
        // Trả về HTTP Status 400 Bad Request
        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxSizeException(org.springframework.web.multipart.MaxUploadSizeExceededException exc) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Dung lượng file vượt quá 5MB. Vui lòng chọn file nhẹ hơn.");
        return ResponseEntity.status(org.springframework.http.HttpStatus.valueOf(413)).body(errorResponse);
    }
}