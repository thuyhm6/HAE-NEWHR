package com.ait.sy.sys.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ait.sy.sys.service.LoggingService;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * LoggingServiceImpl - Implementation của LoggingService
 */
@Service
public class LoggingServiceImpl implements LoggingService {

    private static final Logger logger = LoggerFactory.getLogger(LoggingServiceImpl.class);
    private static final Logger auditLogger = LoggerFactory.getLogger("AUDIT");
    private static final Logger securityLogger = LoggerFactory.getLogger("SECURITY");
    private static final Logger performanceLogger = LoggerFactory.getLogger("PERFORMANCE");
    private static final Logger businessLogger = LoggerFactory.getLogger("BUSINESS");

    @Autowired(required = false)
    private HttpServletRequest request;

    private final ThreadLocal<String> correlationIdThreadLocal = new ThreadLocal<>();

    @Override
    public void logEvent(String eventType, String message, Map<String, Object> context) {
        // Convert string to EventType
        EventType eventTypeEnum;
        try {
            eventTypeEnum = EventType.valueOf(eventType.toUpperCase());
        } catch (IllegalArgumentException e) {
            eventTypeEnum = EventType.SYSTEM_EVENT;
        }
        LogEntry logEntry = createLogEntry(LogLevel.INFO, eventTypeEnum, message);
        enrichLogEntry(logEntry, context);

        String logMessage = formatLogMessage(logEntry);

        switch (eventTypeEnum) {
            case USER_LOGIN:
            case USER_LOGOUT:
            case USER_ACTION:
                auditLogger.info(logMessage);
                break;
            case SECURITY_VIOLATION:
                securityLogger.warn(logMessage);
                break;
            case PERFORMANCE_ISSUE:
                performanceLogger.warn(logMessage);
                break;
            case DATABASE_ERROR:
            case API_ERROR:
                logger.error(logMessage);
                break;
            default:
                logger.info(logMessage);
        }
    }

    @Override
    public void logUserActivity(String userId, String activity, Map<String, Object> details) {
        LogEntry logEntry = createLogEntry(LogLevel.INFO, EventType.USER_ACTION,
                String.format("User %s performed %s", userId, activity));

        logEntry.setUserId(userId);
        enrichLogEntry(logEntry, details);

        String logMessage = formatLogMessage(logEntry);
        auditLogger.info(logMessage);

        // Log to performance metrics if needed
        if (details != null && details.containsKey("executionTime")) {
            Long executionTime = (Long) details.get("executionTime");
            logPerformanceMetric("user_activity_time", executionTime, Map.of("userId", userId, "activity", activity));
        }
    }

    @Override
    public void logSecurityEvent(String eventType, String message, Map<String, Object> context) {
        // Convert string to EventType
        EventType eventTypeEnum;
        try {
            eventTypeEnum = EventType.valueOf(eventType.toUpperCase());
        } catch (IllegalArgumentException e) {
            eventTypeEnum = EventType.SECURITY_VIOLATION;
        }
        LogEntry logEntry = createLogEntry(LogLevel.WARN, eventTypeEnum, message);
        enrichLogEntry(logEntry, context);

        String logMessage = formatLogMessage(logEntry);
        securityLogger.warn(logMessage);

        // Log critical security events to main logger as well
        if (eventTypeEnum == EventType.SECURITY_VIOLATION) {
            logger.error("SECURITY VIOLATION: " + logMessage);
        }
    }

    @Override
    public void logPerformanceMetric(String metricName, long value, Map<String, Object> tags) {
        LogEntry logEntry = createLogEntry(LogLevel.INFO, EventType.PERFORMANCE_ISSUE,
                String.format("Performance metric: %s = %d", metricName, value));

        Map<String, Object> context = new HashMap<>();
        context.put("metricName", metricName);
        context.put("metricValue", value);
        if (tags != null) {
            context.putAll(tags);
        }

        enrichLogEntry(logEntry, context);

        String logMessage = formatLogMessage(logEntry);
        performanceLogger.info(logMessage);

        // Check for performance thresholds
        if (isPerformanceThresholdExceeded(metricName, value)) {
            logger.warn("Performance threshold exceeded: " + logMessage);
        }
    }

    @Override
    public void logDatabaseOperation(String operation, String table, long executionTime, boolean success) {
        LogEntry logEntry = createLogEntry(
                success ? LogLevel.DEBUG : LogLevel.ERROR,
                success ? EventType.SYSTEM_EVENT : EventType.DATABASE_ERROR,
                String.format("Database %s on table %s %s in %dms",
                        operation, table, success ? "completed" : "failed", executionTime));

        Map<String, Object> context = Map.of(
                "operation", operation,
                "table", table,
                "executionTime", executionTime,
                "success", success);

        enrichLogEntry(logEntry, context);

        String logMessage = formatLogMessage(logEntry);

        if (success) {
            logger.debug(logMessage);
            logPerformanceMetric("database_operation_time", executionTime,
                    Map.of("operation", operation, "table", table));
        } else {
            logger.error(logMessage);
        }
    }

    @Override
    public void logApiCall(String endpoint, String method, int statusCode, long responseTime,
            Map<String, Object> requestContext) {

        boolean isGet = "GET".equalsIgnoreCase(method);
        boolean isStatic = endpoint.startsWith("/assets") || endpoint.startsWith("/resources/") || endpoint.contains(".");
        boolean isAuth = endpoint.contains("/login") || endpoint.contains("/logout");

        // Chỉ ghi log những thao tác tác động đến CSDL (POST, PUT, DELETE) hoặc có lỗi
        if (statusCode < 400 && (isGet || isStatic || isAuth)) {
            return;
        }
        // Bỏ qua 404 cho các file tĩnh (ảnh, js, css...) — file không tồn tại là chuyện bình thường
        if (statusCode == 404 && isStatic) {
            return;
        }

        LogLevel level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
        EventType eventType = statusCode >= 400 ? EventType.API_ERROR : EventType.SYSTEM_EVENT;

        LogEntry logEntry = createLogEntry(level, eventType,
                String.format("API %s %s returned %d in %dms", method, endpoint, statusCode, responseTime));

        Map<String, Object> context = new HashMap<>();
        context.put("endpoint", endpoint);
        context.put("method", method);
        context.put("statusCode", statusCode);
        context.put("responseTime", responseTime);
        if (requestContext != null) {
            context.putAll(requestContext);
        }

        enrichLogEntry(logEntry, context);

        String logMessage = formatLogMessage(logEntry);
        logger.info(logMessage);

        // Log performance metrics
        logPerformanceMetric("api_response_time", responseTime,
                Map.of("endpoint", endpoint, "method", method, "statusCode", statusCode));
    }

    @Override
    public void logError(String errorType, String message, Throwable throwable, Map<String, Object> context) {
        LogEntry logEntry = createLogEntry(LogLevel.ERROR, EventType.API_ERROR, message);

        Map<String, Object> errorContext = new HashMap<>();
        errorContext.put("errorType", errorType);
        errorContext.put("exceptionClass", throwable != null ? throwable.getClass().getSimpleName() : null);
        errorContext.put("exceptionMessage", throwable != null ? "REDACTED" : null);

        if (context != null) {
            errorContext.putAll(context);
        }

        enrichLogEntry(logEntry, errorContext);

        String logMessage = formatLogMessage(logEntry);
        logger.error(logMessage, throwable);
    }

    @Override
    public void logBusinessEvent(String eventType, String entityType, String entityId, Map<String, Object> data) {
        // Convert string to EventType
        EventType eventTypeEnum;
        try {
            eventTypeEnum = EventType.valueOf(eventType.toUpperCase());
        } catch (IllegalArgumentException e) {
            eventTypeEnum = EventType.BUSINESS_EVENT;
        }
        LogEntry logEntry = createLogEntry(LogLevel.INFO, eventTypeEnum,
                String.format("Business event: %s on %s[%s]", eventType, entityType, entityId));

        Map<String, Object> context = new HashMap<>();
        context.put("entityType", entityType);
        context.put("entityId", entityId);
        if (data != null) {
            context.putAll(data);
        }

        enrichLogEntry(logEntry, context);

        String logMessage = formatLogMessage(logEntry);
        businessLogger.info(logMessage);
    }

    @Override
    public void setCorrelationId(String correlationId) {
        correlationIdThreadLocal.set(correlationId);
        MDC.put("correlationId", correlationId);
    }

    @Override
    public String getCorrelationId() {
        String correlationId = correlationIdThreadLocal.get();
        if (correlationId == null) {
            correlationId = UUID.randomUUID().toString();
            setCorrelationId(correlationId);
        }
        return correlationId;
    }

    /**
     * Create log entry với basic information
     */
    private LogEntry createLogEntry(LogLevel level, EventType eventType, String message) {
        LogEntry logEntry = new LogEntry(level, eventType, message);
        logEntry.setCorrelationId(getCorrelationId());

        // Add request context if available
        if (request != null) {
            logEntry.setIpAddress(getClientIpAddress());
            logEntry.setUserAgent(request.getHeader("User-Agent"));
            logEntry.setSessionId(request.getSession(false) != null ? request.getSession().getId() : null);
        }

        return logEntry;
    }

    /**
     * Enrich log entry với additional context
     */
    private void enrichLogEntry(LogEntry logEntry, Map<String, Object> context) {
        if (context != null) {
            logEntry.setContext(context);
        }
    }

    /**
     * Format log message cho structured logging
     */
    private String formatLogMessage(LogEntry logEntry) {
        StringBuilder sb = new StringBuilder();
        sb.append("[").append(logEntry.getEventType()).append("] ");
        sb.append(logEntry.getMessage());

        if (logEntry.getCorrelationId() != null) {
            sb.append(" [correlationId=").append(logEntry.getCorrelationId()).append("]");
        }

        if (logEntry.getUserId() != null) {
            sb.append(" [userId=").append(logEntry.getUserId()).append("]");
        }

        if (logEntry.getIpAddress() != null) {
            sb.append(" [ip=").append(logEntry.getIpAddress()).append("]");
        }

        if (logEntry.getContext() != null && !logEntry.getContext().isEmpty()) {
            sb.append(" [context=").append(logEntry.getContext().toString()).append("]");
        }

        return sb.toString();
    }

    /**
     * Get client IP address
     */
    private String getClientIpAddress() {
        try {
            if (request == null)
                return null;
            String remoteAddr = request.getRemoteAddr();
            return (remoteAddr == null || remoteAddr.isBlank()) ? null : remoteAddr;
        } catch (Exception e) {
            // Return null if not in web request context (e.g., scheduled tasks)
            return null;
        }
    }

    /**
     * Check if performance threshold exceeded
     */
    private boolean isPerformanceThresholdExceeded(String metricName, long value) {
        // Define performance thresholds
        Map<String, Long> thresholds = Map.of(
                "api_response_time", 5000L, // 5 seconds
                "database_operation_time", 3000L, // 3 seconds
                "user_activity_time", 10000L // 10 seconds
        );

        Long threshold = thresholds.get(metricName);
        return threshold != null && value > threshold;
    }
}


