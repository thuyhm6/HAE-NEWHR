-- =====================================================
-- QUERY OPTIMIZATION FOR HR-11
-- =====================================================
-- This script contains optimized queries and views for better performance

-- =====================================================
-- 1. OPTIMIZED USER AUTHENTICATION QUERY
-- =====================================================

-- Create optimized view for user authentication
CREATE OR REPLACE VIEW v_user_auth_optimized AS
SELECT 
    u.USER_NO,
    u.PERSON_ID,
    u.USER_NAME,
    u.PASSWORD,
    u.PASSWORD_FIRST,
    u.PASSWORD_SECOND,
    u.PASSWORD_THIRD,
    u.ACTIVITY as USER_ACTIVITY,
    u.CPNY_ID,
    u.USER_TYPE,
    u.CREATE_DATE as USER_CREATE_DATE,
    u.UPDATE_DATE as USER_UPDATE_DATE,
    -- Employee info
    e.LOCAL_NAME,
    e.ENGLISH_NAME,
    e.DEPTNO,
    e.ACTIVITY as EMPLOYEE_ACTIVITY,
    e.HIRE_DATE,
    e.LEAVE_DATE,
    -- Department info
    d.ORG_NAME_LOCAL,
    d.ORG_NAME_ENGLISH,
    d.ACTIVITY as DEPARTMENT_ACTIVITY,
    d.USE_YN as DEPARTMENT_USE_YN
FROM sy_user u
INNER JOIN hr_employee e ON u.PERSON_ID = e.PERSON_ID
INNER JOIN hr_department d ON e.DEPTNO = d.DEPTNO
WHERE u.ACTIVITY = 1 
  AND e.ACTIVITY = 1 
  AND d.ACTIVITY = 1 
  AND d.USE_YN = 'Y';

-- =====================================================
-- 2. OPTIMIZED USER PERMISSIONS QUERY
-- =====================================================

-- Create optimized view for user permissions
CREATE OR REPLACE VIEW v_user_permissions_optimized AS
SELECT 
    u.USER_NO,
    u.USER_NAME,
    u.PERSON_ID,
    -- Role Groups
    rg.ROLE_GROUP_NO,
    rg.ROLE_GROUP_NAME,
    rg.ACTIVITY as ROLE_GROUP_ACTIVITY,
    -- Roles
    r.ROLE_NO,
    r.ROLE_NAME,
    r.ACTIVITY as ROLE_ACTIVITY,
    -- Menus
    m.MENU_NO,
    m.MENU_CODE,
    m.MENU_NAME,
    m.MENU_URL,
    m.PARENT_MENU_NO,
    m.ORDERNO as MENU_ORDER,
    m.ACTIVITY as MENU_ACTIVITY,
    -- Permissions
    rr.PERMISSION_TYPE,
    rr.ACTIVITY as PERMISSION_ACTIVITY
FROM sy_user u
INNER JOIN sy_user_relation ur ON u.USER_NO = ur.USER_NO AND ur.ACTIVITY = 1
INNER JOIN sy_role_group rg ON ur.ROLE_GROUP_NO = rg.ROLE_GROUP_NO AND rg.ACTIVITY = 1
INNER JOIN sy_role r ON rg.ROLE_GROUP_NO = r.ROLE_GROUP_NO AND r.ACTIVITY = 1
INNER JOIN sy_role_relation rr ON r.ROLE_NO = rr.ROLE_NO AND rr.ACTIVITY = 1
INNER JOIN sy_menu m ON rr.MENU_NO = m.MENU_NO AND m.ACTIVITY = 1
WHERE u.ACTIVITY = 1;

-- =====================================================
-- 3. OPTIMIZED EMPLOYEE LIST QUERY
-- =====================================================

-- Create optimized view for employee list
CREATE OR REPLACE VIEW v_employee_list_optimized AS
SELECT 
    e.PERSON_ID,
    e.LOCAL_NAME,
    e.ENGLISH_NAME,
    e.DEPTNO,
    e.POSITION,
    e.HIRE_DATE,
    e.LEAVE_DATE,
    e.ACTIVITY as EMPLOYEE_ACTIVITY,
    -- Department info
    d.ORG_NAME_LOCAL,
    d.ORG_NAME_ENGLISH,
    d.ACTIVITY as DEPARTMENT_ACTIVITY,
    -- Personal info
    pi.BIRTH_DATE,
    pi.GENDER,
    pi.EMAIL,
    pi.PHONE,
    pi.ADDRESS,
    pi.ACTIVITY as PERSONAL_ACTIVITY
FROM hr_employee e
LEFT JOIN hr_department d ON e.DEPTNO = d.DEPTNO AND d.ACTIVITY = 1 AND d.USE_YN = 'Y'
LEFT JOIN hr_personal_info pi ON e.PERSON_ID = pi.PERSON_ID AND pi.ACTIVITY = 1
WHERE e.ACTIVITY = 1;

-- =====================================================
-- 4. OPTIMIZED MENU TREE QUERY
-- =====================================================

-- Create optimized view for menu tree
CREATE OR REPLACE VIEW v_menu_tree_optimized AS
SELECT 
    m.MENU_NO,
    m.MENU_CODE,
    m.MENU_NAME,
    m.MENU_URL,
    m.PARENT_MENU_NO,
    m.ORDERNO,
    m.ACTIVITY,
    m.CREATE_DATE,
    m.UPDATE_DATE,
    -- Parent menu info
    pm.MENU_NAME as PARENT_MENU_NAME,
    pm.MENU_CODE as PARENT_MENU_CODE,
    -- Menu level (calculated)
    LEVEL as MENU_LEVEL,
    -- Menu path (for breadcrumb)
    SYS_CONNECT_BY_PATH(m.MENU_NAME, ' > ') as MENU_PATH
FROM sy_menu m
LEFT JOIN sy_menu pm ON m.PARENT_MENU_NO = pm.MENU_NO
WHERE m.ACTIVITY = 1
START WITH m.PARENT_MENU_NO IS NULL
CONNECT BY PRIOR m.MENU_NO = m.PARENT_MENU_NO
ORDER SIBLINGS BY m.ORDERNO;

-- =====================================================
-- 5. OPTIMIZED DEPARTMENT HIERARCHY QUERY
-- =====================================================

-- Create optimized view for department hierarchy
CREATE OR REPLACE VIEW v_department_hierarchy_optimized AS
SELECT 
    d.DEPTNO,
    d.ORG_NAME_LOCAL,
    d.ORG_NAME_ENGLISH,
    d.PARENT_DEPTNO,
    d.ACTIVITY,
    d.USE_YN,
    d.CREATE_DATE,
    d.UPDATE_DATE,
    -- Parent department info
    pd.ORG_NAME_LOCAL as PARENT_DEPT_NAME,
    -- Department level
    LEVEL as DEPT_LEVEL,
    -- Department path
    SYS_CONNECT_BY_PATH(d.ORG_NAME_LOCAL, ' > ') as DEPT_PATH,
    -- Employee count
    (SELECT COUNT(*) FROM hr_employee e 
     WHERE e.DEPTNO = d.DEPTNO AND e.ACTIVITY = 1) as EMPLOYEE_COUNT
FROM hr_department d
LEFT JOIN hr_department pd ON d.PARENT_DEPTNO = pd.DEPTNO
WHERE d.ACTIVITY = 1 AND d.USE_YN = 'Y'
START WITH d.PARENT_DEPTNO IS NULL
CONNECT BY PRIOR d.DEPTNO = d.PARENT_DEPTNO
ORDER SIBLINGS BY d.DEPTNO;

-- =====================================================
-- 6. PERFORMANCE MONITORING QUERIES
-- =====================================================

-- Query to find slow queries
CREATE OR REPLACE VIEW v_slow_queries AS
SELECT 
    sql_id,
    sql_text,
    executions,
    elapsed_time,
    elapsed_time/executions as avg_elapsed_time,
    cpu_time,
    disk_reads,
    buffer_gets,
    rows_processed
FROM v$sql
WHERE executions > 0
  AND elapsed_time/executions > 1000000  -- More than 1 second average
ORDER BY elapsed_time/executions DESC;

-- Query to find unused indexes
CREATE OR REPLACE VIEW v_unused_indexes AS
SELECT 
    i.index_name,
    i.table_name,
    i.num_rows,
    i.distinct_keys,
    o.used
FROM user_indexes i
LEFT JOIN v$object_usage o ON i.index_name = o.index_name
WHERE o.used = 'NO' OR o.used IS NULL
ORDER BY i.table_name, i.index_name;

-- Query to find table statistics
CREATE OR REPLACE VIEW v_table_statistics AS
SELECT 
    table_name,
    num_rows,
    blocks,
    avg_row_len,
    last_analyzed,
    sample_size
FROM user_tables
ORDER BY num_rows DESC;

-- =====================================================
-- 7. OPTIMIZED STORED PROCEDURES
-- =====================================================

-- Procedure to get user menu tree with permissions
CREATE OR REPLACE PROCEDURE sp_get_user_menu_tree(
    p_user_no IN VARCHAR2,
    p_menu_tree OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_menu_tree FOR
    SELECT DISTINCT
        m.MENU_NO,
        m.MENU_CODE,
        m.MENU_NAME,
        m.MENU_URL,
        m.PARENT_MENU_NO,
        m.ORDERNO,
        m.ACTIVITY,
        LEVEL as MENU_LEVEL
    FROM sy_menu m
    WHERE m.ACTIVITY = 1
      AND m.MENU_NO IN (
          SELECT DISTINCT rr.MENU_NO
          FROM sy_user_relation ur
          INNER JOIN sy_role r ON ur.ROLE_GROUP_NO = r.ROLE_GROUP_NO
          INNER JOIN sy_role_relation rr ON r.ROLE_NO = rr.ROLE_NO
          WHERE ur.USER_NO = p_user_no
            AND ur.ACTIVITY = 1
            AND r.ACTIVITY = 1
            AND rr.ACTIVITY = 1
            AND rr.PERMISSION_TYPE IN ('SELECT', 'ALL')
      )
    START WITH m.PARENT_MENU_NO IS NULL
    CONNECT BY PRIOR m.MENU_NO = m.PARENT_MENU_NO
    ORDER SIBLINGS BY m.ORDERNO;
END;
/

-- Procedure to get employee list with pagination
CREATE OR REPLACE PROCEDURE sp_get_employee_list(
    p_deptno IN VARCHAR2 DEFAULT NULL,
    p_offset IN NUMBER DEFAULT 0,
    p_limit IN NUMBER DEFAULT 20,
    p_employee_list OUT SYS_REFCURSOR,
    p_total_count OUT NUMBER
) AS
BEGIN
    -- Get total count
    SELECT COUNT(*)
    INTO p_total_count
    FROM hr_employee e
    WHERE e.ACTIVITY = 1
      AND (p_deptno IS NULL OR e.DEPTNO = p_deptno);
    
    -- Get employee list with pagination
    OPEN p_employee_list FOR
    SELECT 
        e.PERSON_ID,
        e.LOCAL_NAME,
        e.ENGLISH_NAME,
        e.DEPTNO,
        d.ORG_NAME_LOCAL,
        e.POSITION,
        e.HIRE_DATE,
        e.ACTIVITY
    FROM hr_employee e
    LEFT JOIN hr_department d ON e.DEPTNO = d.DEPTNO AND d.ACTIVITY = 1
    WHERE e.ACTIVITY = 1
      AND (p_deptno IS NULL OR e.DEPTNO = p_deptno)
    ORDER BY e.LOCAL_NAME
    OFFSET p_offset ROWS FETCH NEXT p_limit ROWS ONLY;
END;
/

-- =====================================================
-- 8. QUERY HINTS AND OPTIMIZATIONS
-- =====================================================

-- Example of using hints for critical queries
-- /*+ FIRST_ROWS(10) */ - Optimize for first rows
-- /*+ USE_NL */ - Use nested loop join
-- /*+ USE_HASH */ - Use hash join
-- /*+ INDEX(table_name index_name) */ - Force index usage

-- =====================================================
-- 9. MATERIALIZED VIEWS FOR COMPLEX QUERIES
-- =====================================================

-- Materialized view for user permissions (refresh daily)
CREATE MATERIALIZED VIEW mv_user_permissions
REFRESH COMPLETE ON DEMAND
AS
SELECT 
    u.USER_NO,
    u.USER_NAME,
    LISTAGG(DISTINCT m.MENU_CODE, ',') WITHIN GROUP (ORDER BY m.MENU_CODE) as MENU_CODES,
    LISTAGG(DISTINCT r.ROLE_NAME, ',') WITHIN GROUP (ORDER BY r.ROLE_NAME) as ROLE_NAMES
FROM sy_user u
INNER JOIN sy_user_relation ur ON u.USER_NO = ur.USER_NO AND ur.ACTIVITY = 1
INNER JOIN sy_role r ON ur.ROLE_GROUP_NO = r.ROLE_GROUP_NO AND r.ACTIVITY = 1
INNER JOIN sy_role_relation rr ON r.ROLE_NO = rr.ROLE_NO AND rr.ACTIVITY = 1
INNER JOIN sy_menu m ON rr.MENU_NO = m.MENU_NO AND m.ACTIVITY = 1
WHERE u.ACTIVITY = 1
GROUP BY u.USER_NO, u.USER_NAME;

-- Create index on materialized view
CREATE INDEX idx_mv_user_permissions_user_no ON mv_user_permissions(USER_NO);

-- =====================================================
-- 10. QUERY OPTIMIZATION TIPS
-- =====================================================

/*
OPTIMIZATION TIPS:

1. Use INNER JOIN instead of WHERE clause joins
2. Use EXISTS instead of IN for subqueries
3. Use UNION ALL instead of UNION when possible
4. Use ROWNUM for pagination in Oracle
5. Use bind variables to avoid hard parsing
6. Use appropriate data types
7. Avoid SELECT * in production queries
8. Use column names in ORDER BY
9. Use LIMIT/OFFSET for pagination
10. Use appropriate indexes for WHERE clauses

EXAMPLE OPTIMIZED QUERIES:

-- Bad: Using WHERE clause join
SELECT * FROM sy_user u, hr_employee e 
WHERE u.PERSON_ID = e.PERSON_ID;

-- Good: Using INNER JOIN
SELECT * FROM sy_user u 
INNER JOIN hr_employee e ON u.PERSON_ID = e.PERSON_ID;

-- Bad: Using IN with subquery
SELECT * FROM sy_user 
WHERE PERSON_ID IN (SELECT PERSON_ID FROM hr_employee WHERE ACTIVITY = 1);

-- Good: Using EXISTS
SELECT * FROM sy_user u 
WHERE EXISTS (SELECT 1 FROM hr_employee e 
              WHERE e.PERSON_ID = u.PERSON_ID AND e.ACTIVITY = 1);
*/
