package com.ait.sy.sys.service;

import java.util.Map;

/**
 * HealthCheckService - Interface cho health check functionality
 */
public interface HealthCheckService {

    /**
     * Kiểm tra tổng thể health của ứng dụng
     */
    HealthStatus getOverallHealth();

    /**
     * Kiểm tra health của database
     */
    HealthStatus getDatabaseHealth();

    /**
     * Kiểm tra health của memory
     */
    HealthStatus getMemoryHealth();

    /**
     * Kiểm tra health của disk space
     */
    HealthStatus getDiskHealth();

    /**
     * Kiểm tra health của external services
     */
    Map<String, HealthStatus> getExternalServicesHealth();

    /**
     * Lấy tất cả health checks
     */
    Map<String, HealthStatus> getAllHealthChecks();

    /**
     * Health Status enum
     */
    enum HealthStatus {
        UP("UP", "Service is healthy"),
        DOWN("DOWN", "Service is unhealthy"),
        UNKNOWN("UNKNOWN", "Service status is unknown"),
        OUT_OF_SERVICE("OUT_OF_SERVICE", "Service is out of service");

        private final String status;
        private final String description;

        HealthStatus(String status, String description) {
            this.status = status;
            this.description = description;
        }

        public String getStatus() {
            return status;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * Health Check Result
     */
    class HealthResult {
        private String component;
        private HealthStatus status;
        private String message;
        private Map<String, Object> details;
        private long timestamp;
        private long responseTime;

        public HealthResult() {
            this.timestamp = System.currentTimeMillis();
        }

        public HealthResult(String component, HealthStatus status) {
            this();
            this.component = component;
            this.status = status;
        }

        // Getters and Setters
        public String getComponent() {
            return component;
        }

        public void setComponent(String component) {
            this.component = component;
        }

        public HealthStatus getStatus() {
            return status;
        }

        public void setStatus(HealthStatus status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Map<String, Object> getDetails() {
            return details;
        }

        public void setDetails(Map<String, Object> details) {
            this.details = details;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }

        public long getResponseTime() {
            return responseTime;
        }

        public void setResponseTime(long responseTime) {
            this.responseTime = responseTime;
        }
    }
}
