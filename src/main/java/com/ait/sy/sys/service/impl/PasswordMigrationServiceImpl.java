package com.ait.sy.sys.service.impl;

import com.ait.sy.syRole.mapper.SyUserMapper;
import com.ait.sy.syRole.model.SyUser;
import com.ait.sy.sys.service.PasswordMigrationService;
import com.ait.util.PasswordMigrationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.regex.Pattern;

/**
 * PasswordMigrationServiceImpl - Implementation của PasswordMigrationService
 * WARNING: Chỉ chạy migration một lần duy nhất!
 */
@Service
@Transactional
public class PasswordMigrationServiceImpl implements PasswordMigrationService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordMigrationServiceImpl.class);

    // Pattern để detect BCrypt hash
    private static final Pattern BCRYPT_PATTERN = Pattern.compile("^\\$2[ayb]\\$.{56}$");

    @Autowired
    private SyUserMapper syUserMapper;

    @Autowired
    private PasswordMigrationUtil passwordMigrationUtil;

    @Override
    public void migrateAllPasswords() {
        logger.info("Starting password migration process...");

        try {
            // Lấy tất cả users
            List<SyUser> users = syUserMapper.findAll();
            logger.info("Found {} users to process", users.size());

            int migratedCount = 0;
            int skippedCount = 0;
            int errorCount = 0;

            for (SyUser user : users) {
                try {
                    // Kiểm tra xem password đã được mã hóa chưa
                    if (isPasswordEncoded(user.getPassword())) {
                        logger.debug("Password already encoded for user: {}", user.getUserNo());
                        skippedCount++;
                        continue;
                    }

                    // Mã hóa password
                    String encodedPassword = passwordMigrationUtil.encodePasswordIfNeeded(user.getPassword());

                    // Cập nhật password trong database
                    int updated = syUserMapper.updatePassword(user.getUserNo(), encodedPassword);

                    if (updated > 0) {
                        logger.info("Password migrated successfully for user: {}", user.getUserNo());
                        migratedCount++;
                    } else {
                        logger.warn("Failed to update password for user: {}", user.getUserNo());
                        errorCount++;
                    }

                } catch (Exception e) {
                    logger.error("Error migrating password for user {}", user.getUserNo(), e);
                    errorCount++;
                }
            }

            logger.info("Password migration completed - Migrated: {}, Skipped: {}, Errors: {}",
                    migratedCount, skippedCount, errorCount);

        } catch (Exception e) {
            logger.error("Error during password migration", e);
            throw new RuntimeException("Password migration failed.", e);
        }
    }

    @Override
    public boolean migrateUserPassword(String userNo) {
        try {
            SyUser user = syUserMapper.findByUserNo(userNo);
            if (user == null) {
                logger.warn("User not found: {}", userNo);
                return false;
            }

            // Kiểm tra xem password đã được mã hóa chưa
            if (isPasswordEncoded(user.getPassword())) {
                logger.info("Password already encoded for user: {}", userNo);
                return true;
            }

            // Mã hóa password
            String encodedPassword = passwordMigrationUtil.encodePasswordIfNeeded(user.getPassword());

            // Cập nhật password trong database
            int updated = syUserMapper.updatePassword(userNo, encodedPassword);

            if (updated > 0) {
                logger.info("Password migrated successfully for user: {}", userNo);
                return true;
            } else {
                logger.warn("Failed to update password for user: {}", userNo);
                return false;
            }

        } catch (Exception e) {
            logger.error("Error migrating password for user {}", userNo, e);
            return false;
        }
    }

    @Override
    public boolean isMigrationCompleted() {
        try {
            return syUserMapper.isMigrationCompleted();
        } catch (Exception e) {
            logger.error("Error checking migration status", e);
            return false;
        }
    }

    @Override
    public int getUsersNeedingMigration() {
        try {
            return syUserMapper.countUsersNeedingMigration();
        } catch (Exception e) {
            logger.error("Error counting users needing migration", e);
            return 0;
        }
    }

    /**
     * Kiểm tra xem password đã được mã hóa chưa
     */
    private boolean isPasswordEncoded(String password) {
        return password != null && BCRYPT_PATTERN.matcher(password).matches();
    }
}
