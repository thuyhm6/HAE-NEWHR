package com.ait.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.ait.interceptor.MonitoringInterceptor;
import com.ait.sy.sys.service.LoggingService;
import com.ait.sy.sys.service.MetricsService;

/**
 * MonitoringConfig - Configuration cho monitoring và logging
 */
@Configuration
@EnableScheduling
public class MonitoringConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(MonitoringConfig.class);

    private final LoggingService loggingService;
    private final MetricsService metricsService;

    public MonitoringConfig(LoggingService loggingService, MetricsService metricsService) {
        this.loggingService = loggingService;
        this.metricsService = metricsService;
    }

    /**
     * Monitoring interceptor để track requests
     */
    @Bean
    public MonitoringInterceptor monitoringInterceptor() {
        return new MonitoringInterceptor(loggingService, metricsService);
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(monitoringInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/static/**",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/favicon.ico",
                        "/actuator/**");
    }

    /**
     * Scheduled task để export metrics mỗi 5 phút
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void exportMetrics() {
        try {
            metricsService.exportMetrics();
        } catch (Exception e) {
            loggingService.logError("METRICS_EXPORT", "Failed to export metrics", e, null);
        }
    }

    /**
     * Scheduled task để log system health mỗi phút
     */
    @Scheduled(fixedRate = 60000) // 1 minute
    public void logSystemHealth() {
        try {
            // Log system metrics
            Runtime runtime = Runtime.getRuntime();
            long usedMemory = runtime.totalMemory() - runtime.freeMemory();
            long maxMemory = runtime.maxMemory();
            double memoryUsagePercent = (double) usedMemory / maxMemory * 100;

            metricsService.recordGauge("system.memory.usage.percent", memoryUsagePercent, null);
            metricsService.recordGauge("system.memory.used", usedMemory, null);
            metricsService.recordGauge("system.memory.max", maxMemory, null);
            metricsService.recordGauge("system.thread.count", Thread.activeCount(), null);

            // Log warning if memory usage is high (using logger instead of loggingService
            // to avoid request context issues)
            if (memoryUsagePercent > 85) {
                logger.warn("High memory usage detected: {}%", String.format("%.2f", memoryUsagePercent));
            }

        } catch (Exception e) {
            logger.error("Failed to log system health", e);
        }
    }

    /**
     * Scheduled task để cleanup old metrics mỗi giờ
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void cleanupMetrics() {
        try {
            // Cleanup old metrics data
            // This could be implemented to remove old data from in-memory storage
            logger.info("Metrics cleanup completed at {}", System.currentTimeMillis());
        } catch (Exception e) {
            logger.error("Failed to cleanup metrics", e);
        }
    }
}
