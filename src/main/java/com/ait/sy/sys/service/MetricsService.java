package com.ait.sy.sys.service;

import java.util.Map;
import java.util.List;

/**
 * MetricsService - Interface cho metrics collection và monitoring
 */
public interface MetricsService {

    /**
     * Record counter metric
     */
    void incrementCounter(String name, Map<String, String> tags);

    /**
     * Record gauge metric
     */
    void recordGauge(String name, double value, Map<String, String> tags);

    /**
     * Record timer metric
     */
    void recordTimer(String name, long durationMs, Map<String, String> tags);

    /**
     * Record histogram metric
     */
    void recordHistogram(String name, double value, Map<String, String> tags);

    /**
     * Record business metrics
     */
    void recordBusinessMetric(String metricName, double value, Map<String, String> tags);

    /**
     * Get current metrics snapshot
     */
    Map<String, Object> getMetricsSnapshot();

    /**
     * Get metrics by category
     */
    Map<String, Object> getMetricsByCategory(String category);

    /**
     * Get top slow operations
     */
    List<OperationMetric> getTopSlowOperations(int limit);

    /**
     * Get error rates
     */
    Map<String, Double> getErrorRates();

    /**
     * Get throughput metrics
     */
    Map<String, Double> getThroughputMetrics();

    /**
     * Clear metrics
     */
    void clearMetrics();

    /**
     * Export metrics to external systems
     */
    void exportMetrics();

    /**
     * Operation Metric class
     */
    class OperationMetric {
        private String operation;
        private double averageTime;
        private long totalCalls;
        private long totalErrors;
        private double errorRate;
        private long maxTime;
        private long minTime;

        // Constructors
        public OperationMetric() {
        }

        public OperationMetric(String operation) {
            this.operation = operation;
        }

        // Getters and Setters
        public String getOperation() {
            return operation;
        }

        public void setOperation(String operation) {
            this.operation = operation;
        }

        public double getAverageTime() {
            return averageTime;
        }

        public void setAverageTime(double averageTime) {
            this.averageTime = averageTime;
        }

        public long getTotalCalls() {
            return totalCalls;
        }

        public void setTotalCalls(long totalCalls) {
            this.totalCalls = totalCalls;
        }

        public long getTotalErrors() {
            return totalErrors;
        }

        public void setTotalErrors(long totalErrors) {
            this.totalErrors = totalErrors;
        }

        public double getErrorRate() {
            return errorRate;
        }

        public void setErrorRate(double errorRate) {
            this.errorRate = errorRate;
        }

        public long getMaxTime() {
            return maxTime;
        }

        public void setMaxTime(long maxTime) {
            this.maxTime = maxTime;
        }

        public long getMinTime() {
            return minTime;
        }

        public void setMinTime(long minTime) {
            this.minTime = minTime;
        }
    }

    /**
     * Metric categories
     */
    enum MetricCategory {
        APPLICATION("application"),
        DATABASE("database"),
        API("api"),
        BUSINESS("business"),
        SYSTEM("system"),
        SECURITY("security");

        private final String category;

        MetricCategory(String category) {
            this.category = category;
        }

        public String getCategory() {
            return category;
        }
    }
}
