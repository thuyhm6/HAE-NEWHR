package com.ait.sy.sys.service.impl;

import com.ait.sy.syRole.mapper.SyUserMapper;
import com.ait.sy.syRole.model.SyUser;
import com.ait.sy.sys.service.PasswordUpdateService;
import com.ait.util.PasswordMigrationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.regex.Pattern;

/**
 * PasswordUpdateServiceImpl - Implementation cho cập nhật mật khẩu
 */
@Service
@Transactional
public class PasswordUpdateServiceImpl implements PasswordUpdateService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordUpdateServiceImpl.class);

    // Pattern để detect BCrypt hash
    private static final Pattern BCRYPT_PATTERN = Pattern.compile("^\\$2[ayb]\\$.{56}$");

    @Autowired
    private SyUserMapper syUserMapper;

    @Autowired
    private PasswordMigrationUtil passwordMigrationUtil;

    @Override
    public boolean verifyOldPassword(String userNo, String oldPassword) {
        try {
            SyUser user = syUserMapper.findByUserNo(userNo);
            if (user == null) {
                logger.warn("User not found: {}", userNo);
                return false;
            }

            // Kiểm tra với BCrypt encoder (ưu tiên)
            if (user.matchesPassword(oldPassword, passwordMigrationUtil.getPasswordEncoder())) {
                logger.debug("Old password verified with BCrypt for user: {}", userNo);
                return true;
            }

            // Fallback: Kiểm tra với plain text (backward compatibility)
            // Note: Using deprecated method for backward compatibility only
            @SuppressWarnings("deprecation")
            boolean plainTextMatch = user.matchesPassword(oldPassword);
            if (plainTextMatch) {
                logger.debug("Old password verified with plain text for user: {}", userNo);
                return true;
            }

            logger.warn("Old password verification failed for user: {}", userNo);
            return false;

        } catch (Exception e) {
            logger.error("Error verifying old password for user {}", userNo, e);
            return false;
        }
    }

    @Override
    public boolean updatePassword(String userNo, String newPassword) {
        try {
            // Kiểm tra độ mạnh của mật khẩu mới
            if (!isPasswordStrong(newPassword)) {
                logger.warn("New password is not strong enough for user: {}", userNo);
                return false;
            }

            // Mã hóa mật khẩu mới bằng BCrypt
            String encodedPassword = passwordMigrationUtil.encodePasswordIfNeeded(newPassword);

            // Cập nhật password trong database
            int updated = syUserMapper.updatePassword(userNo, encodedPassword);

            if (updated > 0) {
                logger.info("Password updated successfully for user: {}", userNo);
                return true;
            } else {
                logger.warn("Failed to update password for user: {}", userNo);
                return false;
            }

        } catch (Exception e) {
            logger.error("Error updating password for user {}", userNo, e);
            return false;
        }
    }

    @Override
    public boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }

        // Kiểm tra có ít nhất 1 chữ hoa
        boolean hasUpperCase = password.chars().anyMatch(Character::isUpperCase);

        // Kiểm tra có ít nhất 1 chữ thường
        boolean hasLowerCase = password.chars().anyMatch(Character::isLowerCase);

        // Kiểm tra có ít nhất 1 số
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);

        // Kiểm tra có ít nhất 1 ký tự đặc biệt
        boolean hasSpecialChar = password.chars().anyMatch(ch -> !Character.isLetterOrDigit(ch));

        return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
    }

    @Override
    public UserPasswordInfo getUserPasswordInfo(String userNo) {
        try {
            SyUser user = syUserMapper.findByUserNo(userNo);
            if (user == null) {
                logger.warn("User not found: {}", userNo);
                return null;
            }

            boolean isPasswordEncoded = isPasswordBCryptEncoded(user.getPassword());

            return new UserPasswordInfo(
                    user.getUserNo(),
                    user.getUserName(),
                    user.getPersonId(),
                    isPasswordEncoded);

        } catch (Exception e) {
            logger.error("Error getting user password info for user {}", userNo, e);
            return null;
        }
    }

    /**
     * Kiểm tra xem password đã được mã hóa BCrypt chưa
     */
    private boolean isPasswordBCryptEncoded(String password) {
        return password != null && BCRYPT_PATTERN.matcher(password).matches();
    }
}
