package com.ait.sy.sys.service;

import java.util.Map;

/**
 * LoggingService - Interface cho advanced logging functionality
 */
public interface LoggingService {

    /**
     * Log application event với structured data
     */
    void logEvent(String eventType, String message, Map<String, Object> context);

    /**
     * Log user activity
     */
    void logUserActivity(String userId, String activity, Map<String, Object> details);

    /**
     * Log security event
     */
    void logSecurityEvent(String eventType, String message, Map<String, Object> context);

    /**
     * Log performance metrics
     */
    void logPerformanceMetric(String metricName, long value, Map<String, Object> tags);

    /**
     * Log database operation
     */
    void logDatabaseOperation(String operation, String table, long executionTime, boolean success);

    /**
     * Log API call
     */
    void logApiCall(String endpoint, String method, int statusCode, long responseTime,
            Map<String, Object> requestContext);

    /**
     * Log error với full context
     */
    void logError(String errorType, String message, Throwable throwable, Map<String, Object> context);

    /**
     * Log business event
     */
    void logBusinessEvent(String eventType, String entityType, String entityId, Map<String, Object> data);

    /**
     * Set correlation ID cho request tracking
     */
    void setCorrelationId(String correlationId);

    /**
     * Get current correlation ID
     */
    String getCorrelationId();

    /**
     * Log levels
     */
    enum LogLevel {
        TRACE, DEBUG, INFO, WARN, ERROR, FATAL
    }

    /**
     * Event types
     */
    enum EventType {
        USER_LOGIN,
        USER_LOGOUT,
        USER_ACTION,
        SECURITY_VIOLATION,
        PERFORMANCE_ISSUE,
        DATABASE_ERROR,
        API_ERROR,
        BUSINESS_EVENT,
        SYSTEM_EVENT
    }

    /**
     * Log entry structure
     */
    class LogEntry {
        private String timestamp;
        private LogLevel level;
        private EventType eventType;
        private String message;
        private String correlationId;
        private String userId;
        private String sessionId;
        private String ipAddress;
        private String userAgent;
        private Map<String, Object> context;
        private String stackTrace;

        // Constructors
        public LogEntry() {
            this.timestamp = java.time.Instant.now().toString();
        }

        public LogEntry(LogLevel level, EventType eventType, String message) {
            this();
            this.level = level;
            this.eventType = eventType;
            this.message = message;
        }

        // Getters and Setters
        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }

        public LogLevel getLevel() {
            return level;
        }

        public void setLevel(LogLevel level) {
            this.level = level;
        }

        public EventType getEventType() {
            return eventType;
        }

        public void setEventType(EventType eventType) {
            this.eventType = eventType;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getCorrelationId() {
            return correlationId;
        }

        public void setCorrelationId(String correlationId) {
            this.correlationId = correlationId;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getSessionId() {
            return sessionId;
        }

        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }

        public String getIpAddress() {
            return ipAddress;
        }

        public void setIpAddress(String ipAddress) {
            this.ipAddress = ipAddress;
        }

        public String getUserAgent() {
            return userAgent;
        }

        public void setUserAgent(String userAgent) {
            this.userAgent = userAgent;
        }

        public Map<String, Object> getContext() {
            return context;
        }

        public void setContext(Map<String, Object> context) {
            this.context = context;
        }

        public String getStackTrace() {
            return stackTrace;
        }

        public void setStackTrace(String stackTrace) {
            this.stackTrace = stackTrace;
        }
    }
}
