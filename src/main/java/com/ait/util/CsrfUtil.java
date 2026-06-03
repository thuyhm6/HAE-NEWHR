package com.ait.util;

import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * CsrfUtil - Utility class để xử lý CSRF protection
 */
@Component
public class CsrfUtil {

    private static final String CSRF_TOKEN_NAME = "_csrf_token";
    private static final String CSRF_TOKEN_HEADER = "X-CSRF-TOKEN";
    private static final int TOKEN_LENGTH = 32;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Tạo CSRF token mới
     */
    public String generateCsrfToken() {
        byte[] tokenBytes = new byte[TOKEN_LENGTH];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    /**
     * Lưu CSRF token vào session (chỉ tạo mới nếu chưa có)
     */
    public void saveCsrfToken(HttpSession session) {
        if (session.getAttribute(CSRF_TOKEN_NAME) == null) {
            session.setAttribute(CSRF_TOKEN_NAME, generateCsrfToken());
        }
    }

    /**
     * Lấy CSRF token từ session
     */
    public String getCsrfToken(HttpSession session) {
        return (String) session.getAttribute(CSRF_TOKEN_NAME);
    }

    /**
     * Kiểm tra CSRF token có hợp lệ không
     */
    public boolean validateCsrfToken(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return false;
        }

        String sessionToken = getCsrfToken(session);
        if (sessionToken == null) {
            return false;
        }

        // Lấy token từ header hoặc parameter
        String requestToken = request.getHeader(CSRF_TOKEN_HEADER);
        if (requestToken == null) {
            requestToken = request.getParameter(CSRF_TOKEN_NAME);
        }

        return sessionToken.equals(requestToken);
    }

    /**
     * Xóa CSRF token khỏi session
     */
    public void removeCsrfToken(HttpSession session) {
        session.removeAttribute(CSRF_TOKEN_NAME);
    }

    /**
     * Lấy CSRF token từ request context hiện tại
     */
    public String getCurrentCsrfToken() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            HttpSession session = request.getSession(false);
            if (session != null) {
                return getCsrfToken(session);
            }
        }
        return null;
    }
}
