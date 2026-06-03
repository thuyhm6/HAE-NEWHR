package com.ait.sy.sys.service.impl;

import com.ait.sy.sys.service.DatabaseMonitoringService;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * DatabaseMonitoringServiceImpl - Implementation của DatabaseMonitoringService
 */
@Service
public class DatabaseMonitoringServiceImpl implements DatabaseMonitoringService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMonitoringServiceImpl.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    @Override
    public DatabaseConnectionInfo getConnectionPoolInfo() {
        DatabaseConnectionInfo info = new DatabaseConnectionInfo();

        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
            HikariPoolMXBean poolBean = hikariDataSource.getHikariPoolMXBean();

            info.setActiveConnections(poolBean.getActiveConnections());
            info.setIdleConnections(poolBean.getIdleConnections());
            info.setMaxConnections(hikariDataSource.getMaximumPoolSize());
            info.setConnectionWaitTime(0); // HikariCP doesn't expose this metric directly
            info.setConnectionLeaks(0); // HikariCP handles this automatically
        }

        return info;
    }

    @Override
    public List<SlowQueryInfo> getSlowQueries(int limit) {
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

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, limit);
        List<SlowQueryInfo> slowQueries = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            SlowQueryInfo queryInfo = new SlowQueryInfo();
            queryInfo.setSqlId((String) row.get("SQL_ID"));
            queryInfo.setSqlText((String) row.get("SQL_TEXT"));
            queryInfo.setExecutions(((Number) row.get("EXECUTIONS")).longValue());
            queryInfo.setElapsedTime(((Number) row.get("ELAPSED_TIME")).longValue());
            queryInfo.setAvgElapsedTime(((Number) row.get("AVG_ELAPSED_TIME")).doubleValue());
            queryInfo.setCpuTime(((Number) row.get("CPU_TIME")).longValue());
            queryInfo.setDiskReads(((Number) row.get("DISK_READS")).longValue());
            queryInfo.setBufferGets(((Number) row.get("BUFFER_GETS")).longValue());
            queryInfo.setRowsProcessed(((Number) row.get("ROWS_PROCESSED")).longValue());

            slowQueries.add(queryInfo);
        }

        return slowQueries;
    }

    @Override
    public List<TableStatistics> getTableStatistics() {
        String sql = """
                SELECT
                    table_name,
                    num_rows,
                    blocks,
                    avg_row_len,
                    last_analyzed,
                    sample_size
                FROM user_tables
                ORDER BY num_rows DESC
                """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        List<TableStatistics> statistics = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            TableStatistics stats = new TableStatistics();
            stats.setTableName((String) row.get("TABLE_NAME"));
            stats.setNumRows(((Number) row.get("NUM_ROWS")).longValue());
            stats.setBlocks(((Number) row.get("BLOCKS")).longValue());
            stats.setAvgRowLength(((Number) row.get("AVG_ROW_LEN")).doubleValue());
            stats.setLastAnalyzed((java.sql.Timestamp) row.get("LAST_ANALYZED"));
            stats.setSampleSize(((Number) row.get("SAMPLE_SIZE")).longValue());

            statistics.add(stats);
        }

        return statistics;
    }

    @Override
    public List<IndexUsageInfo> getIndexUsage() {
        String sql = """
                SELECT
                    i.index_name,
                    i.table_name,
                    i.num_rows,
                    i.distinct_keys,
                    i.clustering_factor,
                    CASE WHEN o.used = 'YES' THEN 1 ELSE 0 END as is_used
                FROM user_indexes i
                LEFT JOIN v$object_usage o ON i.index_name = o.index_name
                ORDER BY i.table_name, i.index_name
                """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        List<IndexUsageInfo> indexUsage = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            IndexUsageInfo info = new IndexUsageInfo();
            info.setIndexName((String) row.get("INDEX_NAME"));
            info.setTableName((String) row.get("TABLE_NAME"));
            info.setNumRows(((Number) row.get("NUM_ROWS")).longValue());
            info.setDistinctKeys(((Number) row.get("DISTINCT_KEYS")).longValue());
            info.setClusteringFactor(((Number) row.get("CLUSTERING_FACTOR")).doubleValue());
            info.setUsed(((Number) row.get("IS_USED")).intValue() == 1);

            indexUsage.add(info);
        }

        return indexUsage;
    }

    @Override
    public DatabaseHealthStatus getDatabaseHealth() {
        DatabaseHealthStatus status = new DatabaseHealthStatus();

        try {
            // Check basic connectivity
            jdbcTemplate.queryForObject("SELECT 1 FROM DUAL", Integer.class);
            status.setStatus("CONNECTED");

            // Get active sessions count
            String sessionCountSql = "SELECT COUNT(*) FROM v$session WHERE status = 'ACTIVE'";
            Long activeSessions = jdbcTemplate.queryForObject(sessionCountSql, Long.class);
            status.setActiveSessions(activeSessions != null ? activeSessions : 0);

            // Get long running queries count
            String longRunningSql = """
                    SELECT COUNT(*) FROM v$session
                    WHERE status = 'ACTIVE'
                    AND last_call_et > 300  -- More than 5 minutes
                    """;
            Long longRunningQueries = jdbcTemplate.queryForObject(longRunningSql, Long.class);
            status.setLongRunningQueries(longRunningQueries != null ? longRunningQueries : 0);

            // Check for issues
            List<String> issues = new ArrayList<>();

            // Check for locked tables
            String lockSql = """
                    SELECT COUNT(*) FROM v$locked_object
                    """;
            Long locks = jdbcTemplate.queryForObject(lockSql, Long.class);
            if (locks != null && locks > 0) {
                issues.add("Database locks detected: " + locks);
            }

            // Check for tablespace usage (simplified)
            String tablespaceSql = """
                    SELECT COUNT(*) FROM dba_tablespaces
                    WHERE status != 'ONLINE'
                    """;
            try {
                Long offlineTablespaces = jdbcTemplate.queryForObject(tablespaceSql, Long.class);
                if (offlineTablespaces != null && offlineTablespaces > 0) {
                    issues.add("Offline tablespaces detected: " + offlineTablespaces);
                }
            } catch (Exception e) {
                // Ignore if no DBA privileges
            }

            // Determine health status
            status.setHealthy(issues.isEmpty() &&
                    status.getActiveSessions() < 100 &&
                    status.getLongRunningQueries() < 5);

            if (!issues.isEmpty()) {
                status.setIssues(String.join("; ", issues));
            }

        } catch (Exception e) {
            log.error("Database health check failed", e);
            status.setStatus("ERROR");
            status.setIssues("Database connection error.");
            status.setHealthy(false);
        }

        return status;
    }

    @Override
    public List<DatabaseSession> getActiveSessions() {
        String sql = """
                SELECT
                    sid as session_id,
                    username,
                    program,
                    status,
                    last_call_et as elapsed_time,
                    SUBSTR(sql_text, 1, 100) as sql_text
                FROM v$session s
                LEFT JOIN v$sqltext t ON s.sql_id = t.sql_id AND t.piece = 0
                WHERE s.status = 'ACTIVE'
                ORDER BY s.last_call_et DESC
                """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        List<DatabaseSession> sessions = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            DatabaseSession session = new DatabaseSession();
            session.setSessionId(row.get("SESSION_ID") != null ? row.get("SESSION_ID").toString() : null);
            session.setUsername((String) row.get("USERNAME"));
            session.setProgram((String) row.get("PROGRAM"));
            session.setStatus((String) row.get("STATUS"));
            session.setElapsedTime(
                    row.get("ELAPSED_TIME") != null ? ((Number) row.get("ELAPSED_TIME")).longValue() : 0);
            session.setSqlText((String) row.get("SQL_TEXT"));

            sessions.add(session);
        }

        return sessions;
    }

    @Override
    public List<DatabaseLock> getDatabaseLocks() {
        String sql = """
                SELECT
                    l.lock_type,
                    o.object_name as table_name,
                    l.session_id,
                    s.username,
                    l.status,
                    l.wait_time
                FROM v$locked_object l
                JOIN dba_objects o ON l.object_id = o.object_id
                JOIN v$session s ON l.session_id = s.sid
                ORDER BY l.wait_time DESC
                """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        List<DatabaseLock> locks = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            DatabaseLock lock = new DatabaseLock();
            lock.setLockType((String) row.get("LOCK_TYPE"));
            lock.setTableName((String) row.get("TABLE_NAME"));
            lock.setSessionId(row.get("SESSION_ID") != null ? row.get("SESSION_ID").toString() : null);
            lock.setUsername((String) row.get("USERNAME"));
            lock.setStatus((String) row.get("STATUS"));
            lock.setWaitTime(row.get("WAIT_TIME") != null ? ((Number) row.get("WAIT_TIME")).longValue() : 0);

            locks.add(lock);
        }

        return locks;
    }

    @Override
    public void refreshDatabaseStatistics() {
        try {
            // Gather statistics for all tables
            String[] tables = { "SY_USER", "HR_EMPLOYEE", "HR_DEPARTMENT", "HR_PERSONAL_INFO",
                    "SY_MENU", "SY_ROLE", "SY_ROLE_GROUP", "SY_USER_RELATION", "SY_ROLE_RELATION" };

            for (String table : tables) {
                String sql = "BEGIN DBMS_STATS.GATHER_TABLE_STATS('HTSV_HR', '" + table + "'); END;";
                jdbcTemplate.execute(sql);
            }

        } catch (Exception e) {
            log.error("Failed to refresh database statistics", e);
            throw new RuntimeException("Failed to refresh database statistics.", e);
        }
    }
}
