package com.ait.sy.sys.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.ait.sy.sys.service.BaseHrService;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

/**
 * Base controller class for common HR operations
 * Provides reusable functionality for all HR controllers
 */
@RestController
public abstract class BaseHrController {

    @Autowired
    protected BaseHrService baseHrService;

    /**
     * Check authentication and return user info or error response
     */
    protected ResponseEntity<?> checkAuthentication(HttpSession session) {
        if (!baseHrService.isUserAuthenticated(session)) {
            return ResponseEntity.status(401).body(baseHrService.createErrorResponse("Chưa đăng nhập"));
        }
        return null; // Authentication successful
    }

    /**
     * Get current user or return error response
     */
    protected ResponseEntity<?> getCurrentUserOrError(HttpSession session) {
        ResponseEntity<?> authCheck = checkAuthentication(session);
        if (authCheck != null) {
            return authCheck;
        }
        return null; // User is authenticated
    }

    /**
     * Create success response with data
     */
    protected ResponseEntity<Map<String, Object>> successResponse(String message, Object data) {
        return ResponseEntity.ok(baseHrService.createSuccessResponse(message, data));
    }

    /**
     * Create success response with message only
     */
    protected ResponseEntity<Map<String, String>> successResponse(String message) {
        return ResponseEntity.ok(baseHrService.createSuccessResponse(message));
    }

    /**
     * Create error response
     */
    protected ResponseEntity<Map<String, String>> errorResponse(String errorMessage) {
        return ResponseEntity.badRequest().body(baseHrService.createErrorResponse(errorMessage));
    }

    /**
     * Create error response with status code
     */
    protected ResponseEntity<Map<String, String>> errorResponse(int statusCode, String errorMessage) {
        return ResponseEntity.status(statusCode).body(baseHrService.createErrorResponse(errorMessage));
    }

    /**
     * Create server error response
     */
    protected ResponseEntity<Map<String, String>> serverErrorResponse(String errorMessage) {
        return ResponseEntity.status(500).body(baseHrService.createErrorResponse(errorMessage));
    }

    /**
     * Create not found error response
     */
    protected ResponseEntity<Map<String, String>> notFoundResponse(String errorMessage) {
        return ResponseEntity.status(404).body(baseHrService.createErrorResponse(errorMessage));
    }

    /**
     * Handle exception and return appropriate error response
     */
    protected ResponseEntity<Map<String, String>> handleException(Exception e, String operation) {
        String errorMessage = baseHrService.handleException(e, operation);
        return serverErrorResponse(errorMessage);
    }

    /**
     * Validate required fields and return error response if validation fails
     */
    protected ResponseEntity<Map<String, String>> validateRequiredFields(Map<String, Object> fields) {
        String validationError = baseHrService.validateRequiredFields(fields);
        if (validationError != null) {
            return errorResponse(validationError);
        }
        return null; // Validation successful
    }

    /**
     * Set audit fields for create operation
     */
    protected void setCreateAuditFields(Object entity, HttpSession session) {
        HrUserInfo currentUser = baseHrService.getCurrentUser(session);
        String clientIp = baseHrService.getClientIpAddress(session);
        baseHrService.setCreateAuditFields(entity, currentUser, clientIp);
    }

    /**
     * Set audit fields for update operation
     */
    protected void setUpdateAuditFields(Object entity, HttpSession session) {
        HrUserInfo currentUser = baseHrService.getCurrentUser(session);
        String clientIp = baseHrService.getClientIpAddress(session);
        baseHrService.setUpdateAuditFields(entity, currentUser, clientIp);
    }

    /**
     * Log operation for debugging
     */
    protected void logOperation(String operation, String details) {
        baseHrService.logOperation(operation, details);
    }

    /**
     * Get current user from session
     */
    protected HrUserInfo getCurrentUser(HttpSession session) {
        return baseHrService.getCurrentUser(session);
    }

    /**
     * Get client IP address
     */
    protected String getClientIpAddress(HttpSession session) {
        return baseHrService.getClientIpAddress(session);
    }
}
