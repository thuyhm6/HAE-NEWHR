package com.ait.util;

/**
 * SecurityConstants - Constants cho security configuration
 */
public class SecurityConstants {

    // Session constants
    public static final String USER_SESSION_KEY = "currentHrUser";
    public static final String PERMISSION_SESSION_KEY = "currentPermissionInfo";
    public static final String LOGIN_STATUS_KEY = "isLoggedIn";

    // Session timeout (30 minutes)
    public static final int SESSION_TIMEOUT_MINUTES = 30;

    // Rate limiting constants
    public static final int MAX_LOGIN_ATTEMPTS = 5;
    public static final int LOGIN_WINDOW_MINUTES = 15;
    public static final int MAX_API_REQUESTS = 100;
    public static final int API_WINDOW_SECONDS = 60;

    // CSRF constants
    public static final String CSRF_TOKEN_NAME = "_csrf_token";
    public static final String CSRF_TOKEN_HEADER = "X-CSRF-TOKEN";

    // Password security constants
    public static final int MIN_PASSWORD_LENGTH = 8;
    public static final boolean REQUIRE_SPECIAL_CHARS = true;
    public static final boolean REQUIRE_NUMBERS = true;
    public static final boolean REQUIRE_UPPERCASE = true;

    // BCrypt strength
    public static final int BCRYPT_STRENGTH = 12;

    // Public URLs that don't require authentication
    public static final String[] PUBLIC_URLS = {
            "/",
            "/login",
            "/auth/login",
            "/logout",
            "/assets/**",
            "/static/**",
            "/webjars/**",
            "/error/**",
            "/favicon.ico",
            "/actuator/**",
            "/api/health",
            "/api/csrf-token"
    };

    // Security headers
    public static final String SECURITY_HEADERS = "X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Strict-Transport-Security";

    // Private constructor để prevent instantiation
    private SecurityConstants() {
        throw new UnsupportedOperationException("Utility class");
    }
}
