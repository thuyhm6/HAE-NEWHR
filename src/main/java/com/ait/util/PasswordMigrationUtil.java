package com.ait.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * PasswordMigrationUtil - Utility class cho password migration
 */
@Component
public class PasswordMigrationUtil {

    private final BCryptPasswordEncoder passwordEncoder;

    // Pattern để detect BCrypt hash
    private static final Pattern BCRYPT_PATTERN = Pattern.compile("^\\$2[ayb]\\$.{56}$");

    public PasswordMigrationUtil() {
        this.passwordEncoder = new BCryptPasswordEncoder(12);
    }

    /**
     * Mã hóa password nếu chưa được mã hóa
     * 
     * @param rawPassword Password thô
     * @return Password đã mã hóa
     */
    public String encodePasswordIfNeeded(String rawPassword) {
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            return rawPassword;
        }

        // Kiểm tra xem password đã được mã hóa chưa
        if (isPasswordEncoded(rawPassword)) {
            return rawPassword;
        }

        // Mã hóa password
        return passwordEncoder.encode(rawPassword);
    }

    /**
     * Kiểm tra xem password đã được mã hóa chưa
     * 
     * @param password Password cần kiểm tra
     * @return true nếu đã được mã hóa
     */
    public boolean isPasswordEncoded(String password) {
        return password != null && BCRYPT_PATTERN.matcher(password).matches();
    }

    /**
     * Kiểm tra password thô có khớp với password đã mã hóa không
     * 
     * @param rawPassword     Password thô
     * @param encodedPassword Password đã mã hóa
     * @return true nếu khớp
     */
    public boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }

        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * Lấy BCrypt password encoder
     * 
     * @return BCryptPasswordEncoder instance
     */
    public BCryptPasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }
}