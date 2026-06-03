-- =====================================================
-- TEST PASSWORD MIGRATION SCRIPT
-- =====================================================
-- Chạy script này để test password migration

-- =====================================================
-- 1. TẠO TEST USERS (Chỉ dùng cho testing)
-- =====================================================

-- Tạo test users với plain text passwords
INSERT INTO sy_user (
    USER_NO, PERSON_ID, CPNY_ID, USER_NAME, PASSWORD, 
    USER_TYPE, ACTIVITY, CREATE_DATE, CREATED_BY
) VALUES (
    'TEST001', 'P001', 'C001', 'testuser1', 'password123',
    'USER', 1, SYSDATE, 'TEST_MIGRATION'
);

INSERT INTO sy_user (
    USER_NO, PERSON_ID, CPNY_ID, USER_NAME, PASSWORD, 
    USER_TYPE, ACTIVITY, CREATE_DATE, CREATED_BY
) VALUES (
    'TEST002', 'P002', 'C001', 'testuser2', 'admin456',
    'ADMIN', 1, SYSDATE, 'TEST_MIGRATION'
);

-- =====================================================
-- 2. KIỂM TRA TRƯỚC MIGRATION
-- =====================================================

-- Xem test users trước migration
SELECT 
    USER_NO,
    USER_NAME,
    PASSWORD,
    LENGTH(PASSWORD) as password_length,
    'BEFORE_MIGRATION' as status
FROM sy_user 
WHERE USER_NO IN ('TEST001', 'TEST002');

-- =====================================================
-- 3. CHẠY MIGRATION TỪ JAVA APPLICATION
-- =====================================================

-- Sử dụng các endpoint sau:
-- GET /api/admin/password-migration/status
-- POST /api/admin/password-migration/migrate-all

-- =====================================================
-- 4. KIỂM TRA SAU MIGRATION
-- =====================================================

-- Xem test users sau migration
SELECT 
    USER_NO,
    USER_NAME,
    PASSWORD,
    LENGTH(PASSWORD) as password_length,
    CASE 
        WHEN PASSWORD LIKE '$2%' THEN 'ENCRYPTED'
        ELSE 'PLAIN_TEXT'
    END as password_status,
    'AFTER_MIGRATION' as status
FROM sy_user 
WHERE USER_NO IN ('TEST001', 'TEST002');

-- =====================================================
-- 5. TEST LOGIN (Từ Java application)
-- =====================================================

-- Test login với plain text password (sẽ fail)
-- Test login với BCrypt password (sẽ success)

-- =====================================================
-- 6. CLEANUP TEST DATA
-- =====================================================

-- Xóa test users sau khi test xong
-- DELETE FROM sy_user WHERE USER_NO IN ('TEST001', 'TEST002');

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Kiểm tra migration status
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
-- 8. MONITORING QUERIES
-- =====================================================

-- Monitor password lengths (BCrypt passwords should be 60 characters)
SELECT 
    LENGTH(PASSWORD) as password_length,
    COUNT(*) as user_count,
    CASE 
        WHEN LENGTH(PASSWORD) = 60 THEN 'BCRYPT_ENCRYPTED'
        WHEN LENGTH(PASSWORD) < 20 THEN 'PLAIN_TEXT'
        ELSE 'OTHER'
    END as password_type
FROM sy_user 
WHERE ACTIVITY = 1 AND PASSWORD IS NOT NULL
GROUP BY LENGTH(PASSWORD)
ORDER BY password_length;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Chạy script này trong môi trường test trước
-- 2. Verify kết quả migration
-- 3. Test login functionality
-- 4. Cleanup test data sau khi hoàn thành
