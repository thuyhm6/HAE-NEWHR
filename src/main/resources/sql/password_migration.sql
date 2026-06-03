-- =====================================================
-- PASSWORD MIGRATION SCRIPT - HR-11
-- =====================================================
-- WARNING: Chạy script này một lần duy nhất!
-- Backup database trước khi chạy migration!

-- =====================================================
-- 1. BACKUP TABLE (Tùy chọn - khuyến nghị)
-- =====================================================

-- Tạo bảng backup
CREATE TABLE sy_user_backup AS 
SELECT * FROM sy_user;

-- Tạo index cho bảng backup
CREATE INDEX idx_sy_user_backup_user_no ON sy_user_backup(USER_NO);
CREATE INDEX idx_sy_user_backup_user_name ON sy_user_backup(USER_NAME);

-- =====================================================
-- 2. KIỂM TRA TRẠNG THÁI MIGRATION
-- =====================================================

-- Đếm số users cần migration
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN PASSWORD IS NULL THEN 1 END) as null_passwords,
    COUNT(CASE WHEN PASSWORD IS NOT NULL AND PASSWORD NOT LIKE '$2%' THEN 1 END) as plain_text_passwords,
    COUNT(CASE WHEN PASSWORD LIKE '$2%' THEN 1 END) as encrypted_passwords
FROM sy_user 
WHERE ACTIVITY = 1;

-- Xem danh sách users cần migration
SELECT 
    USER_NO,
    USER_NAME,
    CASE 
        WHEN PASSWORD IS NULL THEN 'NULL'
        WHEN PASSWORD LIKE '$2%' THEN 'ENCRYPTED'
        ELSE 'PLAIN_TEXT'
    END as password_status,
    LENGTH(PASSWORD) as password_length
FROM sy_user 
WHERE ACTIVITY = 1
ORDER BY password_status, USER_NO;

-- =====================================================
-- 3. MIGRATION SCRIPT (Chạy từ Java application)
-- =====================================================

-- Script này sẽ được thực hiện từ Java application
-- Sử dụng PasswordMigrationService để mã hóa passwords

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- Kiểm tra migration đã hoàn thành chưa
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'MIGRATION_COMPLETED'
        ELSE 'MIGRATION_PENDING'
    END as migration_status,
    COUNT(*) as users_needing_migration
FROM sy_user 
WHERE ACTIVITY = 1
  AND PASSWORD IS NOT NULL
  AND PASSWORD NOT LIKE '$2%';

-- Kiểm tra tất cả passwords đã được mã hóa
SELECT 
    COUNT(*) as total_active_users,
    COUNT(CASE WHEN PASSWORD LIKE '$2%' THEN 1 END) as encrypted_passwords,
    COUNT(CASE WHEN PASSWORD IS NOT NULL AND PASSWORD NOT LIKE '$2%' THEN 1 END) as plain_text_passwords
FROM sy_user 
WHERE ACTIVITY = 1;

-- =====================================================
-- 5. ROLLBACK SCRIPT (Nếu cần thiết)
-- =====================================================

-- WARNING: Chỉ sử dụng nếu cần rollback migration!

-- Restore từ backup table
-- UPDATE sy_user SET PASSWORD = (
--     SELECT PASSWORD FROM sy_user_backup 
--     WHERE sy_user_backup.USER_NO = sy_user.USER_NO
-- );

-- =====================================================
-- 6. CLEANUP (Sau khi migration thành công)
-- =====================================================

-- Xóa bảng backup sau khi migration thành công (Tùy chọn)
-- DROP TABLE sy_user_backup;

-- =====================================================
-- 7. MONITORING QUERIES
-- =====================================================

-- Monitor password migration progress
SELECT 
    'Migration Status' as metric,
    CASE 
        WHEN COUNT(CASE WHEN PASSWORD LIKE '$2%' THEN 1 END) = COUNT(*) THEN 'COMPLETED'
        WHEN COUNT(CASE WHEN PASSWORD LIKE '$2%' THEN 1 END) > 0 THEN 'IN_PROGRESS'
        ELSE 'NOT_STARTED'
    END as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN PASSWORD LIKE '$2%' THEN 1 END) as encrypted_count,
    COUNT(CASE WHEN PASSWORD IS NOT NULL AND PASSWORD NOT LIKE '$2%' THEN 1 END) as plain_text_count
FROM sy_user 
WHERE ACTIVITY = 1;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Backup database trước khi chạy migration
-- 2. Chạy migration từ Java application, không chạy trực tiếp SQL
-- 3. Verify kết quả migration trước khi cleanup
-- 4. Monitor logs để đảm bảo migration thành công
-- 5. Test login với một vài users sau migration
