-- =====================================================
-- DATABASE INDEXES OPTIMIZATION FOR HR-11
-- =====================================================
-- This script creates optimized indexes for better query performance

-- =====================================================
-- 1. SY_USER TABLE INDEXES
-- =====================================================

-- Index for username lookup (most frequent)
CREATE INDEX idx_sy_user_username ON sy_user(USER_NAME);

-- Index for person_id lookup
CREATE INDEX idx_sy_user_person_id ON sy_user(PERSON_ID);

-- Index for user_no lookup (primary key, but useful for joins)
CREATE INDEX idx_sy_user_user_no ON sy_user(USER_NO);

-- Composite index for authentication (username + activity)
CREATE INDEX idx_sy_user_auth ON sy_user(USER_NAME, ACTIVITY);

-- Index for activity status
CREATE INDEX idx_sy_user_activity ON sy_user(ACTIVITY);

-- =====================================================
-- 2. HR_EMPLOYEE TABLE INDEXES
-- =====================================================

-- Index for person_id lookup (most frequent)
CREATE INDEX idx_hr_employee_person_id ON hr_employee(PERSON_ID);

-- Index for department lookup
CREATE INDEX idx_hr_employee_deptno ON hr_employee(DEPTNO);

-- Index for employee status
CREATE INDEX idx_hr_employee_activity ON hr_employee(ACTIVITY);

-- Composite index for employee search (dept + activity)
CREATE INDEX idx_hr_employee_dept_activity ON hr_employee(DEPTNO, ACTIVITY);

-- Index for employee name search (local name)
CREATE INDEX idx_hr_employee_local_name ON hr_employee(LOCAL_NAME);

-- Index for employee name search (english name)
CREATE INDEX idx_hr_employee_english_name ON hr_employee(ENGLISH_NAME);

-- =====================================================
-- 3. HR_DEPARTMENT TABLE INDEXES
-- =====================================================

-- Index for department number lookup
CREATE INDEX idx_hr_department_deptno ON hr_department(DEPTNO);

-- Index for department status
CREATE INDEX idx_hr_department_activity ON hr_department(ACTIVITY);

-- Index for department usage
CREATE INDEX idx_hr_department_use_yn ON hr_department(USE_YN);

-- Composite index for active departments
CREATE INDEX idx_hr_department_active ON hr_department(ACTIVITY, USE_YN);

-- Index for department name search
CREATE INDEX idx_hr_department_org_name ON hr_department(ORG_NAME_LOCAL);

-- =====================================================
-- 4. HR_PERSONAL_INFO TABLE INDEXES
-- =====================================================

-- Index for person_id lookup
CREATE INDEX idx_hr_personal_info_person_id ON hr_personal_info(PERSON_ID);

-- Index for personal info activity
CREATE INDEX idx_hr_personal_info_activity ON hr_personal_info(ACTIVITY);

-- =====================================================
-- 5. SY_MENU TABLE INDEXES
-- =====================================================

-- Index for menu code lookup
CREATE INDEX idx_sy_menu_code ON sy_menu(MENU_CODE);

-- Index for menu status
CREATE INDEX idx_sy_menu_activity ON sy_menu(ACTIVITY);

-- Index for menu parent (for tree structure)
CREATE INDEX idx_sy_menu_parent ON sy_menu(PARENT_MENU_NO);

-- Composite index for menu hierarchy
CREATE INDEX idx_sy_menu_hierarchy ON sy_menu(PARENT_MENU_NO, ACTIVITY);

-- Index for menu order
CREATE INDEX idx_sy_menu_order ON sy_menu(ORDERNO);

-- =====================================================
-- 6. SY_ROLE TABLE INDEXES
-- =====================================================

-- Index for role lookup
CREATE INDEX idx_sy_role_role_no ON sy_role(ROLE_NO);

-- Index for role group lookup
CREATE INDEX idx_sy_role_group ON sy_role(ROLE_GROUP_NO);

-- Index for role status
CREATE INDEX idx_sy_role_activity ON sy_role(ACTIVITY);

-- Composite index for role group + activity
CREATE INDEX idx_sy_role_group_active ON sy_role(ROLE_GROUP_NO, ACTIVITY);

-- =====================================================
-- 7. SY_ROLE_GROUP TABLE INDEXES
-- =====================================================

-- Index for role group lookup
CREATE INDEX idx_sy_role_group_no ON sy_role_group(ROLE_GROUP_NO);

-- Index for role group status
CREATE INDEX idx_sy_role_group_activity ON sy_role_group(ACTIVITY);

-- =====================================================
-- 8. SY_USER_RELATION TABLE INDEXES
-- =====================================================

-- Index for user lookup
CREATE INDEX idx_sy_user_relation_user_no ON sy_user_relation(USER_NO);

-- Index for role group lookup
CREATE INDEX idx_sy_user_relation_role_group ON sy_user_relation(ROLE_GROUP_NO);

-- Index for user relation status
CREATE INDEX idx_sy_user_relation_activity ON sy_user_relation(ACTIVITY);

-- Composite index for user + role group + activity
CREATE INDEX idx_sy_user_relation_composite ON sy_user_relation(USER_NO, ROLE_GROUP_NO, ACTIVITY);

-- =====================================================
-- 9. SY_ROLE_RELATION TABLE INDEXES
-- =====================================================

-- Index for role lookup
CREATE INDEX idx_sy_role_relation_role_no ON sy_role_relation(ROLE_NO);

-- Index for menu lookup
CREATE INDEX idx_sy_role_relation_menu_no ON sy_role_relation(MENU_NO);

-- Index for permission type
CREATE INDEX idx_sy_role_relation_permission ON sy_role_relation(PERMISSION_TYPE);

-- Composite index for role + menu + permission
CREATE INDEX idx_sy_role_relation_composite ON sy_role_relation(ROLE_NO, MENU_NO, PERMISSION_TYPE);

-- =====================================================
-- 10. PERFORMANCE OPTIMIZATION INDEXES
-- =====================================================

-- Index for date-based queries
CREATE INDEX idx_sy_user_create_date ON sy_user(CREATE_DATE);
CREATE INDEX idx_sy_user_update_date ON sy_user(UPDATE_DATE);

-- Index for employee date fields
CREATE INDEX idx_hr_employee_hire_date ON hr_employee(HIRE_DATE);
CREATE INDEX idx_hr_employee_leave_date ON hr_employee(LEAVE_DATE);

-- =====================================================
-- 11. PARTIAL INDEXES (Oracle 12c+)
-- =====================================================

-- Partial index for active users only
CREATE INDEX idx_sy_user_active_only ON sy_user(USER_NAME) WHERE ACTIVITY = 1;

-- Partial index for active employees only
CREATE INDEX idx_hr_employee_active_only ON hr_employee(PERSON_ID) WHERE ACTIVITY = 1;

-- Partial index for active departments only
CREATE INDEX idx_hr_department_active_only ON hr_department(DEPTNO) WHERE ACTIVITY = 1 AND USE_YN = 'Y';

-- =====================================================
-- 12. FUNCTION-BASED INDEXES
-- =====================================================

-- Case-insensitive username search
CREATE INDEX idx_sy_user_username_upper ON sy_user(UPPER(USER_NAME));

-- Case-insensitive employee name search
CREATE INDEX idx_hr_employee_name_upper ON hr_employee(UPPER(LOCAL_NAME));

-- Case-insensitive department name search
CREATE INDEX idx_hr_department_name_upper ON hr_department(UPPER(ORG_NAME_LOCAL));

-- =====================================================
-- 13. COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Index for user authentication with all related tables
CREATE INDEX idx_user_auth_complete ON sy_user(USER_NAME, ACTIVITY, PERSON_ID);

-- Index for employee department lookup
CREATE INDEX idx_employee_dept_lookup ON hr_employee(PERSON_ID, DEPTNO, ACTIVITY);

-- Index for menu permission lookup
CREATE INDEX idx_menu_permission_lookup ON sy_role_relation(ROLE_NO, MENU_NO, PERMISSION_TYPE, ACTIVITY);

-- =====================================================
-- 14. STATISTICS COLLECTION
-- =====================================================

-- Gather statistics for all tables
BEGIN
    DBMS_STATS.GATHER_TABLE_STATS('HTSV_HR', 'SY_USER');
    DBMS_STATS.GATHER_TABLE_STATS('HTSV_HR', 'HR_EMPLOYEE');
    DBMS_STATS.GATHER_TABLE_STATS('HTSV_HR', 'HR_DEPARTMENT');
    DBMS_STATS.GATHER_TABLE_STATS('HTSV_HR', 'HR_PERSONAL_INFO');
    DBMS_STATS.GATHER_TABLE_STATS('HTSV_HR', 'SY_MENU');
    DBMS_STATS.GATHER_TABLE_STATS('HTSV_HR', 'SY_ROLE');
    DBMS_STATS.GATHER_TABLE_STATS('HTSV_HR', 'SY_ROLE_GROUP');
    DBMS_STATS.GATHER_TABLE_STATS('HTSV_HR', 'SY_USER_RELATION');
    DBMS_STATS.GATHER_TABLE_STATS('HTSV_HR', 'SY_ROLE_RELATION');
END;
/

-- =====================================================
-- 15. INDEX MONITORING
-- =====================================================

-- Enable index monitoring for key indexes
ALTER INDEX idx_sy_user_username MONITORING USAGE;
ALTER INDEX idx_hr_employee_person_id MONITORING USAGE;
ALTER INDEX idx_hr_department_deptno MONITORING USAGE;
ALTER INDEX idx_sy_menu_code MONITORING USAGE;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check index usage
SELECT index_name, table_name, monitoring, used
FROM v$object_usage
WHERE table_name IN ('SY_USER', 'HR_EMPLOYEE', 'HR_DEPARTMENT', 'SY_MENU')
ORDER BY table_name, index_name;

-- Check index statistics
SELECT table_name, index_name, num_rows, distinct_keys, clustering_factor
FROM user_indexes
WHERE table_name IN ('SY_USER', 'HR_EMPLOYEE', 'HR_DEPARTMENT', 'SY_MENU')
ORDER BY table_name, index_name;
