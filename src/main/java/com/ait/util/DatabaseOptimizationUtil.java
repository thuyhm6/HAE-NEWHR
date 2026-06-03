package com.ait.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * DatabaseOptimizationUtil - Utility để tối ưu hóa database operations
 */
@Component
public class DatabaseOptimizationUtil {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Kiểm tra index usage
     */
    public boolean isIndexUsed(String indexName) {
        String sql = """
                SELECT used FROM v$object_usage
                WHERE index_name = ?
                """;

        try {
            String result = jdbcTemplate.queryForObject(sql, String.class, indexName);
            return "YES".equals(result);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Lấy thông tin table size
     */
    public long getTableSize(String tableName) {
        String sql = """
                SELECT num_rows * avg_row_len as table_size
                FROM user_tables
                WHERE table_name = ?
                """;

        try {
            Long size = jdbcTemplate.queryForObject(sql, Long.class, tableName.toUpperCase());
            return size != null ? size : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Kiểm tra table statistics
     */
    public boolean hasValidStatistics(String tableName) {
        String sql = """
                SELECT CASE WHEN last_analyzed > SYSDATE - 7 THEN 1 ELSE 0 END as has_valid_stats
                FROM user_tables
                WHERE table_name = ?
                """;

        try {
            Integer result = jdbcTemplate.queryForObject(sql, Integer.class, tableName.toUpperCase());
            return result != null && result == 1;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Lấy danh sách unused indexes
     */
    public List<String> getUnusedIndexes() {
        String sql = """
                SELECT i.index_name
                FROM user_indexes i
                LEFT JOIN v$object_usage o ON i.index_name = o.index_name
                WHERE o.used = 'NO' OR o.used IS NULL
                ORDER BY i.table_name, i.index_name
                """;

        return jdbcTemplate.queryForList(sql, String.class);
    }

    /**
     * Lấy danh sách slow queries
     */
    public List<Map<String, Object>> getSlowQueries(int limit) {
        String sql = """
                SELECT
                    sql_id,
                    SUBSTR(sql_text, 1, 100) as sql_text,
                    executions,
                    elapsed_time,
                    CASE WHEN executions > 0 THEN elapsed_time/executions ELSE 0 END as avg_elapsed_time,
                    cpu_time,
                    disk_reads,
                    buffer_gets,
                    rows_processed
                FROM v$sql
                WHERE executions > 0
                  AND elapsed_time/executions > 1000000  -- More than 1 second average
                ORDER BY elapsed_time/executions DESC
                FETCH FIRST ? ROWS ONLY
                """;

        return jdbcTemplate.queryForList(sql, limit);
    }

    /**
     * Kiểm tra database locks
     */
    public boolean hasDatabaseLocks() {
        String sql = "SELECT COUNT(*) FROM v$locked_object";

        try {
            Long lockCount = jdbcTemplate.queryForObject(sql, Long.class);
            return lockCount != null && lockCount > 0;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Lấy thông tin active sessions
     */
    public long getActiveSessionCount() {
        String sql = "SELECT COUNT(*) FROM v$session WHERE status = 'ACTIVE'";

        try {
            Long count = jdbcTemplate.queryForObject(sql, Long.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Lấy thông tin connection pool usage
     */
    public double getConnectionPoolUsage() {
        if (jdbcTemplate.getDataSource() instanceof com.zaxxer.hikari.HikariDataSource) {
            com.zaxxer.hikari.HikariDataSource hikariDataSource = (com.zaxxer.hikari.HikariDataSource) jdbcTemplate
                    .getDataSource();

            if (hikariDataSource != null) {
                com.zaxxer.hikari.HikariPoolMXBean poolBean = hikariDataSource.getHikariPoolMXBean();
                if (poolBean != null) {
                    int active = poolBean.getActiveConnections();
                    int max = hikariDataSource.getMaximumPoolSize();

                    return (double) active / max * 100;
                }
            }
        }
        return 0;
    }

    /**
     * Kiểm tra database health
     */
    public boolean isDatabaseHealthy() {
        try {
            // Check basic connectivity
            jdbcTemplate.queryForObject("SELECT 1 FROM DUAL", Integer.class);

            // Check for locks
            if (hasDatabaseLocks()) {
                return false;
            }

            // Check active sessions (should be less than 100)
            if (getActiveSessionCount() > 100) {
                return false;
            }

            // Check connection pool usage (should be less than 90%)
            if (getConnectionPoolUsage() > 90) {
                return false;
            }

            return true;

        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Tối ưu hóa query với hints
     */
    public String optimizeQueryWithHints(String query, String hint) {
        if (query == null || query.trim().isEmpty()) {
            return query;
        }

        String upperQuery = query.toUpperCase().trim();

        if (upperQuery.startsWith("SELECT")) {
            switch (hint.toUpperCase()) {
                case "FIRST_ROWS":
                    return query.replaceFirst("(?i)SELECT", "SELECT /*+ FIRST_ROWS(10) */");
                case "ALL_ROWS":
                    return query.replaceFirst("(?i)SELECT", "SELECT /*+ ALL_ROWS */");
                case "USE_NL":
                    return query.replaceFirst("(?i)SELECT", "SELECT /*+ USE_NL */");
                case "USE_HASH":
                    return query.replaceFirst("(?i)SELECT", "SELECT /*+ USE_HASH */");
                case "USE_MERGE":
                    return query.replaceFirst("(?i)SELECT", "SELECT /*+ USE_MERGE */");
                default:
                    return query;
            }
        }

        return query;
    }

    /**
     * Tạo pagination query cho Oracle
     */
    public String createPaginationQuery(String baseQuery, int offset, int limit) {
        return String.format(
                "SELECT * FROM (%s) WHERE ROWNUM BETWEEN %d AND %d",
                baseQuery, offset + 1, offset + limit);
    }

    /**
     * Tạo query với ORDER BY
     */
    public String addOrderBy(String query, String column, String direction) {
        if (column == null || column.trim().isEmpty()) {
            return query;
        }

        String dir = "ASC";
        if ("DESC".equalsIgnoreCase(direction)) {
            dir = "DESC";
        }

        return query + " ORDER BY " + column + " " + dir;
    }

    /**
     * Kiểm tra query performance
     */
    public boolean isQuerySlow(String sqlId) {
        String sql = """
                SELECT CASE WHEN elapsed_time/executions > 1000000 THEN 1 ELSE 0 END as is_slow
                FROM v$sql
                WHERE sql_id = ? AND executions > 0
                """;

        try {
            Integer result = jdbcTemplate.queryForObject(sql, Integer.class, sqlId);
            return result != null && result == 1;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Lấy execution plan cho query
     */
    public List<Map<String, Object>> getExecutionPlan(String sqlId) {
        String sql = """
                SELECT
                    plan_line_id,
                    plan_depth,
                    plan_operation,
                    plan_options,
                    plan_object_name,
                    plan_object_type,
                    plan_cost,
                    plan_cardinality,
                    plan_bytes
                FROM v$sql_plan
                WHERE sql_id = ?
                ORDER BY plan_line_id
                """;

        return jdbcTemplate.queryForList(sql, sqlId);
    }
}
