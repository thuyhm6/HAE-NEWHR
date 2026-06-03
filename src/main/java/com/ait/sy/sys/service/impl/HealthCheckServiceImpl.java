package com.ait.sy.sys.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ait.sy.sys.service.HealthCheckService;

import javax.sql.DataSource;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * HealthCheckServiceImpl - Implementation của HealthCheckService
 */
@Service
public class HealthCheckServiceImpl implements HealthCheckService {

    private static final Logger log = LoggerFactory.getLogger(HealthCheckServiceImpl.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    private final MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();

    @Override
    public HealthStatus getOverallHealth() {
        try {
            // Kiểm tra tất cả components
            HealthStatus dbHealth = getDatabaseHealth();
            HealthStatus memoryHealth = getMemoryHealth();
            HealthStatus diskHealth = getDiskHealth();

            // Nếu có bất kỳ component nào DOWN thì overall health là DOWN
            if (dbHealth == HealthStatus.DOWN ||
                    memoryHealth == HealthStatus.DOWN ||
                    diskHealth == HealthStatus.DOWN) {
                return HealthStatus.DOWN;
            }

            // Nếu có component nào UNKNOWN thì overall health là UNKNOWN
            if (dbHealth == HealthStatus.UNKNOWN ||
                    memoryHealth == HealthStatus.UNKNOWN ||
                    diskHealth == HealthStatus.UNKNOWN) {
                return HealthStatus.UNKNOWN;
            }

            return HealthStatus.UP;

        } catch (Exception e) {
            return HealthStatus.UNKNOWN;
        }
    }

    @Override
    public HealthStatus getDatabaseHealth() {
        try {
            long startTime = System.currentTimeMillis();

            // Test database connection với query đơn giản
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            long responseTime = System.currentTimeMillis() - startTime;

            if (result != null && result == 1) {
                // Kiểm tra response time
                if (responseTime > 5000) { // > 5 seconds
                    return HealthStatus.OUT_OF_SERVICE;
                }
                return HealthStatus.UP;
            }

            return HealthStatus.DOWN;

        } catch (Exception e) {
            return HealthStatus.DOWN;
        }
    }

    @Override
    public HealthStatus getMemoryHealth() {
        try {
            MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();

            long heapUsed = heapUsage.getUsed();
            long heapMax = heapUsage.getMax();
            // long nonHeapUsed = nonHeapUsage.getUsed();

            // Tính phần trăm memory usage
            double heapUsagePercent = (double) heapUsed / heapMax * 100;
            // double totalMemoryUsage = (double) (heapUsed + nonHeapUsed) / heapMax * 100;

            // Thresholds
            if (heapUsagePercent > 95) {
                return HealthStatus.DOWN; // Critical memory usage
            } else if (heapUsagePercent > 85) {
                return HealthStatus.OUT_OF_SERVICE; // High memory usage
            } else if (heapUsagePercent > 75) {
                return HealthStatus.UNKNOWN; // Warning memory usage
            }

            return HealthStatus.UP;

        } catch (Exception e) {
            return HealthStatus.UNKNOWN;
        }
    }

    @Override
    public HealthStatus getDiskHealth() {
        try {
            File root = new File("/");
            long totalSpace = root.getTotalSpace();
            long freeSpace = root.getFreeSpace();
            long usedSpace = totalSpace - freeSpace;

            double usagePercent = (double) usedSpace / totalSpace * 100;

            // Thresholds
            if (usagePercent > 95) {
                return HealthStatus.DOWN; // Critical disk usage
            } else if (usagePercent > 85) {
                return HealthStatus.OUT_OF_SERVICE; // High disk usage
            } else if (usagePercent > 75) {
                return HealthStatus.UNKNOWN; // Warning disk usage
            }

            return HealthStatus.UP;

        } catch (Exception e) {
            return HealthStatus.UNKNOWN;
        }
    }

    @Override
    public Map<String, HealthStatus> getExternalServicesHealth() {
        Map<String, HealthStatus> services = new HashMap<>();

        // Kiểm tra external services (có thể mở rộng)
        services.put("email-service", checkEmailService());
        services.put("file-storage", checkFileStorageService());
        services.put("cache-service", checkCacheService());

        return services;
    }

    private HealthStatus checkEmailService() {
        try {
            // Kiểm tra email service configuration
            // Có thể ping SMTP server hoặc check configuration
            return HealthStatus.UP; // Placeholder
        } catch (Exception e) {
            return HealthStatus.DOWN;
        }
    }

    private HealthStatus checkFileStorageService() {
        try {
            // Kiểm tra file storage service
            File tempDir = new File(System.getProperty("java.io.tmpdir"));
            if (tempDir.exists() && tempDir.canWrite()) {
                return HealthStatus.UP;
            }
            return HealthStatus.DOWN;
        } catch (Exception e) {
            return HealthStatus.DOWN;
        }
    }

    private HealthStatus checkCacheService() {
        try {
            // Kiểm tra cache service (Caffeine, Redis, etc.)
            // Placeholder implementation
            return HealthStatus.UP;
        } catch (Exception e) {
            return HealthStatus.DOWN;
        }
    }

    @Override
    public Map<String, HealthStatus> getAllHealthChecks() {
        Map<String, HealthStatus> allChecks = new HashMap<>();

        // Chạy tất cả health checks song song
        CompletableFuture<HealthStatus> dbFuture = CompletableFuture.supplyAsync(this::getDatabaseHealth);
        CompletableFuture<HealthStatus> memoryFuture = CompletableFuture.supplyAsync(this::getMemoryHealth);
        CompletableFuture<HealthStatus> diskFuture = CompletableFuture.supplyAsync(this::getDiskHealth);

        try {
            // Wait for all checks với timeout
            allChecks.put("database", dbFuture.get(5, TimeUnit.SECONDS));
            allChecks.put("memory", memoryFuture.get(2, TimeUnit.SECONDS));
            allChecks.put("disk", diskFuture.get(2, TimeUnit.SECONDS));

            // Add external services
            allChecks.putAll(getExternalServicesHealth());

            // Add overall health
            allChecks.put("overall", getOverallHealth());

        } catch (Exception e) {
            // Set timeout or error status
            allChecks.put("database", HealthStatus.UNKNOWN);
            allChecks.put("memory", HealthStatus.UNKNOWN);
            allChecks.put("disk", HealthStatus.UNKNOWN);
            allChecks.put("overall", HealthStatus.UNKNOWN);
        }

        return allChecks;
    }

    /**
     * Lấy detailed health information
     */
    public Map<String, HealthResult> getDetailedHealthChecks() {
        Map<String, HealthResult> detailedChecks = new HashMap<>();

        // Database detailed check
        HealthResult dbResult = new HealthResult("database", getDatabaseHealth());
        dbResult.setMessage("Database connectivity check");
        Map<String, Object> dbDetails = new HashMap<>();
        try {
            dbDetails.put("connectionPool", getConnectionPoolInfo());
            dbDetails.put("activeConnections", getActiveConnections());
        } catch (Exception e) {
            log.warn("Failed to collect database health details", e);
            dbDetails.put("error", "Unable to collect database details.");
        }
        dbResult.setDetails(dbDetails);
        detailedChecks.put("database", dbResult);

        // Memory detailed check
        HealthResult memoryResult = new HealthResult("memory", getMemoryHealth());
        memoryResult.setMessage("Memory usage check");
        Map<String, Object> memoryDetails = new HashMap<>();
        try {
            MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
            memoryDetails.put("heapUsed", heapUsage.getUsed());
            memoryDetails.put("heapMax", heapUsage.getMax());
            memoryDetails.put("heapUsagePercent", (double) heapUsage.getUsed() / heapUsage.getMax() * 100);
            memoryDetails.put("nonHeapUsed", memoryBean.getNonHeapMemoryUsage().getUsed());
        } catch (Exception e) {
            log.warn("Failed to collect memory health details", e);
            memoryDetails.put("error", "Unable to collect memory details.");
        }
        memoryResult.setDetails(memoryDetails);
        detailedChecks.put("memory", memoryResult);

        // Disk detailed check
        HealthResult diskResult = new HealthResult("disk", getDiskHealth());
        diskResult.setMessage("Disk space check");
        Map<String, Object> diskDetails = new HashMap<>();
        try {
            File root = new File("/");
            long totalSpace = root.getTotalSpace();
            long freeSpace = root.getFreeSpace();
            diskDetails.put("totalSpace", totalSpace);
            diskDetails.put("freeSpace", freeSpace);
            diskDetails.put("usedSpace", totalSpace - freeSpace);
            diskDetails.put("usagePercent", (double) (totalSpace - freeSpace) / totalSpace * 100);
        } catch (Exception e) {
            log.warn("Failed to collect disk health details", e);
            diskDetails.put("error", "Unable to collect disk details.");
        }
        diskResult.setDetails(diskDetails);
        detailedChecks.put("disk", diskResult);

        return detailedChecks;
    }

    private Map<String, Object> getConnectionPoolInfo() {
        Map<String, Object> poolInfo = new HashMap<>();
        try {
            if (dataSource instanceof com.zaxxer.hikari.HikariDataSource) {
                com.zaxxer.hikari.HikariDataSource hikariDS = (com.zaxxer.hikari.HikariDataSource) dataSource;
                poolInfo.put("maximumPoolSize", hikariDS.getMaximumPoolSize());
                poolInfo.put("minimumIdle", hikariDS.getMinimumIdle());
                poolInfo.put("activeConnections", hikariDS.getHikariPoolMXBean().getActiveConnections());
                poolInfo.put("idleConnections", hikariDS.getHikariPoolMXBean().getIdleConnections());
                poolInfo.put("totalConnections", hikariDS.getHikariPoolMXBean().getTotalConnections());
            }
        } catch (Exception e) {
            log.warn("Failed to collect connection pool info", e);
            poolInfo.put("error", "Unable to get connection pool info.");
        }
        return poolInfo;
    }

    private int getActiveConnections() {
        try {
            if (dataSource instanceof com.zaxxer.hikari.HikariDataSource) {
                com.zaxxer.hikari.HikariDataSource hikariDS = (com.zaxxer.hikari.HikariDataSource) dataSource;
                return hikariDS.getHikariPoolMXBean().getActiveConnections();
            }
        } catch (Exception e) {
            // Ignore
        }
        return -1;
    }
}
