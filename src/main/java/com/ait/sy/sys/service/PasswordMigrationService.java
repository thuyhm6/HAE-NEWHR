package com.ait.sy.sys.service;

/**
 * PasswordMigrationService - Service để migrate passwords từ plain text sang
 * BCrypt
 */
public interface PasswordMigrationService {

    /**
     * Migrate tất cả passwords trong database
     * WARNING: Chỉ chạy một lần duy nhất!
     */
    void migrateAllPasswords();

    /**
     * Migrate password cho một user cụ thể
     */
    boolean migrateUserPassword(String userNo);

    /**
     * Kiểm tra xem migration đã được thực hiện chưa
     */
    boolean isMigrationCompleted();

    /**
     * Lấy số lượng users cần migrate
     */
    int getUsersNeedingMigration();
}
