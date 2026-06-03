package com.ait.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * GlobalExceptionHandler - Global exception handler cho toàn bộ application
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle BusinessException
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(BusinessException ex, WebRequest request) {
        logger.warn("Business exception occurred: {} - {}", ex.getErrorCode(), ex.getUserMessage());

        Map<String, Object> response = createErrorResponse(
                ex.getErrorCode(),
                ex.getUserMessage(),
                HttpStatus.BAD_REQUEST.value(),
                request.getDescription(false));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle ValidationException
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(ValidationException ex, WebRequest request) {
        logger.warn("Validation exception occurred: {} - {}", ex.getErrorCode(), ex.getUserMessage());

        Map<String, Object> response = createErrorResponse(
                ex.getErrorCode(),
                ex.getUserMessage(),
                HttpStatus.BAD_REQUEST.value(),
                request.getDescription(false));

        // Add validation errors
        if (ex.hasValidationErrors()) {
            List<Map<String, String>> validationErrors = new ArrayList<>();
            for (ValidationException.ValidationError error : ex.getValidationErrors()) {
                Map<String, String> errorDetail = new HashMap<>();
                errorDetail.put("field", error.getField());
                errorDetail.put("message", error.getMessage());
                validationErrors.add(errorDetail);
            }
            response.put("validationErrors", validationErrors);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle TechnicalException
     */
    @ExceptionHandler(TechnicalException.class)
    public ResponseEntity<Map<String, Object>> handleTechnicalException(TechnicalException ex, WebRequest request) {
        logger.error("Technical exception occurred: {} - {}", ex.getErrorCode(), ex.getUserMessage(), ex);

        Map<String, Object> response = createErrorResponse(
                ex.getErrorCode(),
                "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getDescription(false));

        // In development, include technical message
        if (isDevelopmentEnvironment()) {
            response.put("technicalMessage", ex.getTechnicalMessage());
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Handle MethodArgumentNotValidException (Spring validation)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex,
            WebRequest request) {
        logger.warn("Method argument validation failed");

        List<Map<String, String>> validationErrors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            Map<String, String> errorDetail = new HashMap<>();
            errorDetail.put("field", error.getField());
            errorDetail.put("message", error.getDefaultMessage());
            validationErrors.add(errorDetail);
        }

        Map<String, Object> response = createErrorResponse(
                "VALIDATION_ERROR",
                "Dữ liệu đầu vào không hợp lệ",
                HttpStatus.BAD_REQUEST.value(),
                request.getDescription(false));
        response.put("validationErrors", validationErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle BindException
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<Map<String, Object>> handleBindException(BindException ex, WebRequest request) {
        logger.warn("Bind exception occurred");

        List<Map<String, String>> validationErrors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            Map<String, String> errorDetail = new HashMap<>();
            errorDetail.put("field", error.getField());
            errorDetail.put("message", error.getDefaultMessage());
            validationErrors.add(errorDetail);
        }

        Map<String, Object> response = createErrorResponse(
                "BIND_ERROR",
                "Lỗi ràng buộc dữ liệu",
                HttpStatus.BAD_REQUEST.value(),
                request.getDescription(false));
        response.put("validationErrors", validationErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex,
            WebRequest request) {
        logger.warn("Illegal argument exception: {}", ex.getMessage());

        Map<String, Object> response = createErrorResponse(
                "ILLEGAL_ARGUMENT",
                "Tham số không hợp lệ: " + ex.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                request.getDescription(false));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle NoHandlerFoundException (404)
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoHandlerFoundException(NoHandlerFoundException ex,
            WebRequest request) {
        logger.warn("No handler found for: {}", ex.getRequestURL());

        Map<String, Object> response = createErrorResponse(
                "NOT_FOUND",
                "Không tìm thấy tài nguyên được yêu cầu",
                HttpStatus.NOT_FOUND.value(),
                request.getDescription(false));

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handle NoResourceFoundException (Status 404 for static resources)
     * Suppress error logs for missing static resources
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Object> handleNoResourceFoundException(NoResourceFoundException ex, WebRequest request) {
        // Do not log as error to keep logs clean
        logger.debug("Resource not found: {}", ex.getResourcePath());

        if (isAjaxRequest(request)) {
            Map<String, Object> response = createErrorResponse(
                    "RESOURCE_NOT_FOUND",
                    "Không tìm thấy tài nguyên: " + ex.getResourcePath(),
                    HttpStatus.NOT_FOUND.value(),
                    request.getDescription(false));
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            // For static resources or browser navigation, just return 404 without body
            // to avoid HttpMediaTypeNotAcceptableException
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Handle SecurityException
     */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurityException(SecurityException ex, WebRequest request) {
        logger.warn("Security exception: {}", ex.getMessage());

        Map<String, Object> response = createErrorResponse(
                "SECURITY_ERROR",
                ex.getMessage(),
                HttpStatus.FORBIDDEN.value(),
                request.getDescription(false));

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Handle RuntimeException
     */
    @ExceptionHandler(RuntimeException.class)
    public Object handleRuntimeException(RuntimeException ex, WebRequest request) {
        logger.error("Runtime exception occurred", ex);

        if (isAjaxRequest(request)) {
            Map<String, Object> response = createErrorResponse(
                    "RUNTIME_ERROR",
                    "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    request.getDescription(false));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } else {
            // For browser requests, return error view
            return new org.springframework.web.servlet.ModelAndView("error");
        }
    }

    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public Object handleGenericException(Exception ex, WebRequest request) {
        logger.error("Unexpected exception occurred", ex);

        if (isAjaxRequest(request)) {
            Map<String, Object> response = createErrorResponse(
                    "INTERNAL_ERROR",
                    "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    request.getDescription(false));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } else {
            // For browser requests, return error view
            return new org.springframework.web.servlet.ModelAndView("error");
        }
    }

    /**
     * Create standardized error response
     */
    private Map<String, Object> createErrorResponse(String errorCode, String message, int status, String path) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status);
        response.put("error", errorCode);
        response.put("message", message);
        response.put("path", path);
        return response;
    }

    /**
     * Check if the request is an AJAX request or expects JSON
     */
    private boolean isAjaxRequest(WebRequest request) {
        String requestedWith = request.getHeader("X-Requested-With");
        String accept = request.getHeader("Accept");
        return "XMLHttpRequest".equals(requestedWith) || (accept != null && accept.contains("application/json"));
    }

    /**
     * Check if running in development environment
     */
    private boolean isDevelopmentEnvironment() {
        String profile = System.getProperty("spring.profiles.active");
        return "dev".equals(profile) || "development".equals(profile);
    }
}
