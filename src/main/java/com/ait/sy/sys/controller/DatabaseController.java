package com.ait.sy.sys.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ait.sy.sys.service.DatabaseMonitoringService;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DatabaseController - REST API cho database monitoring
 * Yêu cầu quyền ADMIN để truy cập
 */
@RestController
@RequestMapping("/api/database")
public class DatabaseController {

    @Autowired
    private DatabaseMonitoringService databaseMonitoringService;

    /**
     * Kiểm tra quyền admin — trả về ResponseEntity lỗi nếu không đủ quyền, null nếu
     * ok
     */
    private ResponseEntity<Map<String, Object>> checkAdminAccess(HttpSession session) {
        if (session == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));
        }
        HrUserInfo user = (HrUserInfo) session.getAttribute("currentHrUser");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));
        }
        String userType = user.getSyUser() != null ? user.getSyUser().getUserType() : null;
        boolean isAdmin = "ADMIN".equalsIgnoreCase(userType) || "SYS".equalsIgnoreCase(userType);
        if (!isAdmin) {
            return ResponseEntity.status(403).body(Map.of("error", "Không có quyền truy cập. Chỉ dành cho Admin."));
        }
        return null;
    }

    /**
     * Lấy thông tin connection pool
     */
    @GetMapping("/connection-pool")
    public ResponseEntity<Map<String, Object>> getConnectionPoolInfo(HttpSession session) {
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null)
            return authError;
        try {
            DatabaseMonitoringService.DatabaseConnectionInfo info = databaseMonitoringService.getConnectionPoolInfo();

            Map<String, Object> response = new HashMap<>();
            response.put("activeConnections", info.getActiveConnections());
            response.put("idleConnections", info.getIdleConnections());
            response.put("maxConnections", info.getMaxConnections());
            response.put("connectionWaitTime", info.getConnectionWaitTime());
            response.put("connectionLeaks", info.getConnectionLeaks());
            response.put("utilizationPercentage",
                    (double) info.getActiveConnections() / info.getMaxConnections() * 100);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get connection pool info.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Lấy danh sách slow queries
     */
    @GetMapping("/slow-queries")
    public ResponseEntity<Map<String, Object>> getSlowQueries(
            @RequestParam(defaultValue = "10") int limit, HttpSession session) {
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null)
            return authError;
        try {
            int safeLimit = Math.min(Math.max(limit, 1), 100);
            List<DatabaseMonitoringService.SlowQueryInfo> slowQueries = databaseMonitoringService.getSlowQueries(safeLimit);

            Map<String, Object> response = new HashMap<>();
            response.put("slowQueries", slowQueries);
            response.put("count", slowQueries.size());
            response.put("limit", safeLimit);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get slow queries.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Lấy thông tin table statistics
     */
    @GetMapping("/table-statistics")
    public ResponseEntity<Map<String, Object>> getTableStatistics(HttpSession session) {
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null)
            return authError;
        try {
            List<DatabaseMonitoringService.TableStatistics> statistics = databaseMonitoringService.getTableStatistics();

            Map<String, Object> response = new HashMap<>();
            response.put("tableStatistics", statistics);
            response.put("count", statistics.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get table statistics.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Lấy thông tin index usage
     */
    @GetMapping("/index-usage")
    public ResponseEntity<Map<String, Object>> getIndexUsage(HttpSession session) {
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null)
            return authError;
        try {
            List<DatabaseMonitoringService.IndexUsageInfo> indexUsage = databaseMonitoringService.getIndexUsage();

            Map<String, Object> response = new HashMap<>();
            response.put("indexUsage", indexUsage);
            response.put("totalIndexes", indexUsage.size());
            response.put("usedIndexes", indexUsage.stream().mapToLong(info -> info.isUsed() ? 1 : 0).sum());
            response.put("unusedIndexes", indexUsage.stream().mapToLong(info -> info.isUsed() ? 0 : 1).sum());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get index usage.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Lấy database health status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getDatabaseHealth(HttpSession session) {
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null)
            return authError;
        try {
            DatabaseMonitoringService.DatabaseHealthStatus health = databaseMonitoringService.getDatabaseHealth();

            Map<String, Object> response = new HashMap<>();
            response.put("healthy", health.isHealthy());
            response.put("status", health.getStatus());
            response.put("activeSessions", health.getActiveSessions());
            response.put("longRunningQueries", health.getLongRunningQueries());
            response.put("issues", health.getIssues());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get database health.");
            errorResponse.put("healthy", false);
            errorResponse.put("status", "ERROR");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Lấy thông tin active sessions
     */
    @GetMapping("/active-sessions")
    public ResponseEntity<Map<String, Object>> getActiveSessions(HttpSession session) {
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null)
            return authError;
        try {
            List<DatabaseMonitoringService.DatabaseSession> sessions = databaseMonitoringService.getActiveSessions();

            Map<String, Object> response = new HashMap<>();
            response.put("activeSessions", sessions);
            response.put("count", sessions.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get active sessions.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Lấy thông tin database locks
     */
    @GetMapping("/locks")
    public ResponseEntity<Map<String, Object>> getDatabaseLocks(HttpSession session) {
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null)
            return authError;
        try {
            List<DatabaseMonitoringService.DatabaseLock> locks = databaseMonitoringService.getDatabaseLocks();

            Map<String, Object> response = new HashMap<>();
            response.put("databaseLocks", locks);
            response.put("count", locks.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get database locks.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Refresh database statistics
     */
    @PostMapping("/refresh-statistics")
    public ResponseEntity<Map<String, Object>> refreshDatabaseStatistics(HttpSession session) {
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null)
            return authError;
        try {
            databaseMonitoringService.refreshDatabaseStatistics();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Database statistics refreshed successfully");
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to refresh database statistics.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Lấy database summary
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDatabaseSummary(HttpSession session) {
        ResponseEntity<Map<String, Object>> authError = checkAdminAccess(session);
        if (authError != null)
            return authError;
        try {
            // Get connection pool info
            DatabaseMonitoringService.DatabaseConnectionInfo connectionInfo = databaseMonitoringService
                    .getConnectionPoolInfo();

            // Get database health
            DatabaseMonitoringService.DatabaseHealthStatus health = databaseMonitoringService.getDatabaseHealth();

            // Get table statistics
            List<DatabaseMonitoringService.TableStatistics> tableStats = databaseMonitoringService.getTableStatistics();

            // Get index usage
            List<DatabaseMonitoringService.IndexUsageInfo> indexUsage = databaseMonitoringService.getIndexUsage();

            Map<String, Object> response = new HashMap<>();
            response.put("connectionPool", Map.of(
                    "activeConnections", connectionInfo.getActiveConnections(),
                    "maxConnections", connectionInfo.getMaxConnections(),
                    "utilizationPercentage",
                    (double) connectionInfo.getActiveConnections() / connectionInfo.getMaxConnections() * 100));

            response.put("health", Map.of(
                    "healthy", health.isHealthy(),
                    "status", health.getStatus(),
                    "activeSessions", health.getActiveSessions(),
                    "longRunningQueries", health.getLongRunningQueries()));

            response.put("statistics", Map.of(
                    "totalTables", tableStats.size(),
                    "totalIndexes", indexUsage.size(),
                    "usedIndexes", indexUsage.stream().mapToLong(info -> info.isUsed() ? 1 : 0).sum(),
                    "unusedIndexes", indexUsage.stream().mapToLong(info -> info.isUsed() ? 0 : 1).sum()));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get database summary.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}

