package com.ait.sy.sys.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ait.sy.sys.service.PerformanceMonitoringService;
import com.ait.sy.sys.service.PerformanceMonitoringService.PerformanceStats;

import java.util.HashMap;
import java.util.Map;

/**
 * PerformanceController - REST API cho performance monitoring
 */
@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    @Autowired
    private PerformanceMonitoringService performanceMonitoringService;

    /**
     * Lấy performance statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPerformanceStats() {
        try {
            PerformanceStats stats = performanceMonitoringService.getPerformanceStats();

            Map<String, Object> response = new HashMap<>();
            response.put("totalRequests", stats.getTotalRequests());
            response.put("averageResponseTime", stats.getAverageResponseTime());
            response.put("maxResponseTime", stats.getMaxResponseTime());
            response.put("minResponseTime", stats.getMinResponseTime());
            response.put("cacheHitRate", String.format("%.2f%%", stats.getCacheHitRate()));
            response.put("activeUsers", stats.getActiveUsers());
            response.put("memoryUsage", formatBytes(stats.getMemoryUsage()));
            response.put("databaseQueries", stats.getDatabaseQueryCount());
            response.put("averageQueryTime", stats.getAverageQueryTime());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get performance stats.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Lấy memory usage
     */
    @GetMapping("/memory")
    public ResponseEntity<Map<String, Object>> getMemoryUsage() {
        try {
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            long maxMemory = runtime.maxMemory();

            Map<String, Object> response = new HashMap<>();
            response.put("totalMemory", formatBytes(totalMemory));
            response.put("freeMemory", formatBytes(freeMemory));
            response.put("usedMemory", formatBytes(usedMemory));
            response.put("maxMemory", formatBytes(maxMemory));
            response.put("usagePercentage", String.format("%.2f%%", (double) usedMemory / maxMemory * 100));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get memory usage.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());

        try {
            PerformanceStats stats = performanceMonitoringService.getPerformanceStats();
            response.put("performance", "OK");
            response.put("totalRequests", stats.getTotalRequests());

            // Check if system is healthy based on performance metrics
            Runtime runtime = Runtime.getRuntime();
            boolean isHealthy = stats.getAverageResponseTime() < 1000 && // Less than 1 second
                    stats.getCacheHitRate() > 50 && // More than 50% cache hit rate
                    stats.getMemoryUsage() < runtime.maxMemory() * 0.8; // Less than 80% memory usage

            response.put("healthy", isHealthy);

        } catch (Exception e) {
            response.put("performance", "ERROR");
            response.put("healthy", false);
            response.put("error", "Performance check failed.");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Format bytes to human readable format
     */
    private String formatBytes(long bytes) {
        if (bytes < 1024)
            return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}

