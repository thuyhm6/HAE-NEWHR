package com.ait.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.ait.sy.sys.service.LoggingService;
import com.ait.sy.sys.service.MetricsService;

import java.util.HashMap;
import java.util.Map;

/**
 * MonitoringInterceptor - Interceptor để monitor và log requests
 */
@Component
public class MonitoringInterceptor implements HandlerInterceptor {

    private final LoggingService loggingService;
    private final MetricsService metricsService;

    public MonitoringInterceptor(LoggingService loggingService, MetricsService metricsService) {
        this.loggingService = loggingService;
        this.metricsService = metricsService;
    }

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull Object handler) {
        long startTime = System.currentTimeMillis();
        request.setAttribute("startTime", startTime);

        // Set correlation ID if not present
        String correlationId = request.getHeader("X-Correlation-ID");
        if (correlationId == null) {
            correlationId = java.util.UUID.randomUUID().toString();
        }
        loggingService.setCorrelationId(correlationId);

        // Record request start metrics
        Map<String, String> tags = Map.of(
                "method", request.getMethod(),
                "endpoint", request.getRequestURI());

        metricsService.incrementCounter("http.requests.total", tags);

        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull Object handler,
            @Nullable Exception ex) {
        try {
            long startTime = (Long) request.getAttribute("startTime");
            long duration = System.currentTimeMillis() - startTime;

            String method = request.getMethod();
            String endpoint = request.getRequestURI();
            int statusCode = response.getStatus();

            // Prepare context for logging
            Map<String, Object> context = new HashMap<>();
            context.put("method", method);
            context.put("endpoint", endpoint);
            context.put("statusCode", statusCode);
            context.put("duration", duration);
            context.put("userAgent", request.getHeader("User-Agent"));
            context.put("referer", request.getHeader("Referer"));

            // Get user info if available
            String userId = (String) request.getAttribute("userId");
            if (userId != null) {
                context.put("userId", userId);
            }

            // Log API call
            loggingService.logApiCall(endpoint, method, statusCode, duration, context);

            // Record metrics
            Map<String, String> tags = Map.of(
                    "method", method,
                    "endpoint", endpoint,
                    "status", String.valueOf(statusCode));

            metricsService.recordTimer("http.request.duration", duration, tags);

            // Record error metrics if applicable
            if (statusCode >= 400) {
                metricsService.incrementCounter("http.requests.errors", tags);

                // Bỏ qua 404 cho file tĩnh (ảnh, js, css, resources...)
                boolean isStaticResource = endpoint.startsWith("/resources/")
                        || endpoint.startsWith("/assets/")
                        || endpoint.contains(".");
                if (statusCode == 404 && isStaticResource) {
                    return;
                }

                // Log error
                String eventType = statusCode >= 500 ? "API_ERROR" : "SYSTEM_EVENT";

                loggingService.logEvent(
                        eventType,
                        String.format("HTTP %d error for %s %s", statusCode, method, endpoint),
                        context);
            }

            // Log exception if present
            if (ex != null) {
                loggingService.logError(
                        "REQUEST_EXCEPTION",
                        String.format("Exception during %s %s", method, endpoint),
                        ex,
                        context);
            }

        } catch (Exception e) {
            // Log interceptor error without throwing to avoid breaking the request
            loggingService.logError("INTERCEPTOR_ERROR", "Error in monitoring interceptor", e, null);
        }
    }
}
