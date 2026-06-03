package com.ait.sy.sys.service.impl;

import io.micrometer.core.instrument.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ait.sy.sys.service.MetricsService;

import java.io.File;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * MetricsServiceImpl - Implementation của MetricsService
 */
@Service
public class MetricsServiceImpl implements MetricsService {

    @Autowired
    private MeterRegistry meterRegistry;

    // In-memory storage cho custom metrics
    private final Map<String, AtomicLong> counters = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> gauges = new ConcurrentHashMap<>();
    private final Map<String, List<Long>> timers = new ConcurrentHashMap<>();
    private final Map<String, List<Double>> histograms = new ConcurrentHashMap<>();
    private final Map<String, OperationMetric> operationMetrics = new ConcurrentHashMap<>();

    @Override
    public void incrementCounter(String name, Map<String, String> tags) {
        // Micrometer counter
        Counter.Builder counterBuilder = Counter.builder(name);
        if (tags != null && !tags.isEmpty()) {
            for (Map.Entry<String, String> tag : tags.entrySet()) {
                counterBuilder.tag(tag.getKey(), tag.getValue());
            }
        }
        Counter counter = counterBuilder.register(meterRegistry);
        counter.increment();

        // Custom counter
        String key = name + ":" + tagsToString(tags);
        counters.computeIfAbsent(key, k -> new AtomicLong(0)).incrementAndGet();
    }

    @Override
    public void recordGauge(String name, double value, Map<String, String> tags) {
        // Micrometer gauge - use simple registration
        Gauge.builder(name, () -> value)
                .register(meterRegistry);

        // Custom gauge
        String key = name + ":" + tagsToString(tags);
        gauges.computeIfAbsent(key, k -> new AtomicLong(0)).set((long) value);
    }

    @Override
    public void recordTimer(String name, long durationMs, Map<String, String> tags) {
        // Micrometer timer
        io.micrometer.core.instrument.Timer.Builder timerBuilder = io.micrometer.core.instrument.Timer.builder(name);
        if (tags != null && !tags.isEmpty()) {
            for (Map.Entry<String, String> tag : tags.entrySet()) {
                timerBuilder.tag(tag.getKey(), tag.getValue());
            }
        }
        io.micrometer.core.instrument.Timer timer = timerBuilder.register(meterRegistry);
        timer.record(durationMs, java.util.concurrent.TimeUnit.MILLISECONDS);

        // Custom timer
        String key = name + ":" + tagsToString(tags);
        timers.computeIfAbsent(key, k -> new ArrayList<>()).add(durationMs);

        // Update operation metrics
        updateOperationMetrics(name, durationMs, false);
    }

    @Override
    public void recordHistogram(String name, double value, Map<String, String> tags) {
        // Micrometer histogram
        DistributionSummary.Builder histogramBuilder = DistributionSummary.builder(name);
        if (tags != null && !tags.isEmpty()) {
            for (Map.Entry<String, String> tag : tags.entrySet()) {
                histogramBuilder.tag(tag.getKey(), tag.getValue());
            }
        }
        DistributionSummary histogram = histogramBuilder.register(meterRegistry);
        histogram.record(value);

        // Custom histogram
        String key = name + ":" + tagsToString(tags);
        histograms.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
    }

    @Override
    public void recordBusinessMetric(String metricName, double value, Map<String, String> tags) {
        // Record as gauge
        recordGauge("business." + metricName, value, tags);

        // Log business metric
        incrementCounter("business_metrics_total", Map.of("metric", metricName));
    }

    @Override
    public Map<String, Object> getMetricsSnapshot() {
        Map<String, Object> snapshot = new HashMap<>();

        // Application metrics
        snapshot.put("application", getApplicationMetrics());

        // Database metrics
        snapshot.put("database", getDatabaseMetrics());

        // API metrics
        snapshot.put("api", getApiMetrics());

        // Business metrics
        snapshot.put("business", getBusinessMetrics());

        // System metrics
        snapshot.put("system", getSystemMetrics());

        // Security metrics
        snapshot.put("security", getSecurityMetrics());

        // Custom metrics
        snapshot.put("custom", getCustomMetrics());

        return snapshot;
    }

    @Override
    public Map<String, Object> getMetricsByCategory(String category) {
        switch (category.toLowerCase()) {
            case "application":
                return getApplicationMetrics();
            case "database":
                return getDatabaseMetrics();
            case "api":
                return getApiMetrics();
            case "business":
                return getBusinessMetrics();
            case "system":
                return getSystemMetrics();
            case "security":
                return getSecurityMetrics();
            default:
                return getCustomMetrics();
        }
    }

    @Override
    public List<OperationMetric> getTopSlowOperations(int limit) {
        return operationMetrics.values().stream()
                .sorted((a, b) -> Double.compare(b.getAverageTime(), a.getAverageTime()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Double> getErrorRates() {
        Map<String, Double> errorRates = new HashMap<>();

        for (Map.Entry<String, OperationMetric> entry : operationMetrics.entrySet()) {
            OperationMetric metric = entry.getValue();
            if (metric.getTotalCalls() > 0) {
                double errorRate = (double) metric.getTotalErrors() / metric.getTotalCalls() * 100;
                errorRates.put(entry.getKey(), errorRate);
            }
        }

        return errorRates;
    }

    @Override
    public Map<String, Double> getThroughputMetrics() {
        Map<String, Double> throughput = new HashMap<>();

        // Calculate requests per minute
        long totalRequests = counters.values().stream()
                .mapToLong(AtomicLong::get)
                .sum();

        throughput.put("total_requests", (double) totalRequests);
        throughput.put("requests_per_minute", calculateRequestsPerMinute());

        return throughput;
    }

    @Override
    public void clearMetrics() {
        counters.clear();
        gauges.clear();
        timers.clear();
        histograms.clear();
        operationMetrics.clear();

        // Clear Micrometer metrics
        meterRegistry.clear();
    }

    @Override
    public void exportMetrics() {
        // Export to external monitoring systems
        // This could be implemented to send metrics to Prometheus, InfluxDB, etc.

        // Map<String, Object> metrics = getMetricsSnapshot();

        // Log metrics for external collection
        // System.out.println("=== METRICS EXPORT ===");
        // System.out.println(metrics.toString());
        // System.out.println("======================");
    }

    /**
     * Get application metrics
     */
    private Map<String, Object> getApplicationMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // JVM metrics
        Runtime runtime = Runtime.getRuntime();
        metrics.put("memory_used", runtime.totalMemory() - runtime.freeMemory());
        metrics.put("memory_max", runtime.maxMemory());
        metrics.put("memory_usage_percent",
                (double) (runtime.totalMemory() - runtime.freeMemory()) / runtime.maxMemory() * 100);

        // Thread metrics
        metrics.put("thread_count", Thread.activeCount());

        // Uptime
        metrics.put("uptime_ms", System.currentTimeMillis() - getStartTime());

        return metrics;
    }

    /**
     * Get database metrics
     */
    private Map<String, Object> getDatabaseMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Database operation metrics
        operationMetrics.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith("database"))
                .forEach(entry -> {
                    OperationMetric metric = entry.getValue();
                    metrics.put(entry.getKey() + "_avg_time", metric.getAverageTime());
                    metrics.put(entry.getKey() + "_total_calls", metric.getTotalCalls());
                    metrics.put(entry.getKey() + "_error_rate", metric.getErrorRate());
                });

        return metrics;
    }

    /**
     * Get API metrics
     */
    private Map<String, Object> getApiMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // API operation metrics
        operationMetrics.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith("api"))
                .forEach(entry -> {
                    OperationMetric metric = entry.getValue();
                    metrics.put(entry.getKey() + "_avg_time", metric.getAverageTime());
                    metrics.put(entry.getKey() + "_total_calls", metric.getTotalCalls());
                    metrics.put(entry.getKey() + "_error_rate", metric.getErrorRate());
                });

        return metrics;
    }

    /**
     * Get business metrics
     */
    private Map<String, Object> getBusinessMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Business operation metrics
        operationMetrics.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith("business"))
                .forEach(entry -> {
                    OperationMetric metric = entry.getValue();
                    metrics.put(entry.getKey() + "_avg_time", metric.getAverageTime());
                    metrics.put(entry.getKey() + "_total_calls", metric.getTotalCalls());
                });

        return metrics;
    }

    /**
     * Get system metrics
     */
    private Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // System resource metrics
        metrics.put("cpu_cores", Runtime.getRuntime().availableProcessors());
        metrics.put("free_memory", Runtime.getRuntime().freeMemory());
        metrics.put("total_memory", Runtime.getRuntime().totalMemory());
        metrics.put("max_memory", Runtime.getRuntime().maxMemory());

        // Disk space metrics (if available)
        File root = new File("/");
        metrics.put("disk_total", root.getTotalSpace());
        metrics.put("disk_free", root.getFreeSpace());
        metrics.put("disk_usage_percent",
                (double) (root.getTotalSpace() - root.getFreeSpace()) / root.getTotalSpace() * 100);

        return metrics;
    }

    /**
     * Get security metrics
     */
    private Map<String, Object> getSecurityMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Security event counters
        counters.entrySet().stream()
                .filter(entry -> entry.getKey().contains("security"))
                .forEach(entry -> metrics.put(entry.getKey(), entry.getValue().get()));

        return metrics;
    }

    /**
     * Get custom metrics
     */
    private Map<String, Object> getCustomMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Custom counters
        Map<String, Long> customCounters = counters.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().get()));
        metrics.put("counters", customCounters);

        // Custom gauges
        Map<String, Long> customGauges = gauges.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().get()));
        metrics.put("gauges", customGauges);

        // Timer statistics
        Map<String, Object> timerStats = new HashMap<>();
        timers.forEach((key, values) -> {
            if (!values.isEmpty()) {
                Map<String, Object> stats = new HashMap<>();
                stats.put("count", values.size());
                stats.put("avg", values.stream().mapToLong(Long::longValue).average().orElse(0));
                stats.put("min", values.stream().mapToLong(Long::longValue).min().orElse(0));
                stats.put("max", values.stream().mapToLong(Long::longValue).max().orElse(0));
                timerStats.put(key, stats);
            }
        });
        metrics.put("timers", timerStats);

        return metrics;
    }

    /**
     * Update operation metrics
     */
    private void updateOperationMetrics(String operation, long durationMs, boolean isError) {
        OperationMetric metric = operationMetrics.computeIfAbsent(operation, k -> new OperationMetric(operation));

        metric.setTotalCalls(metric.getTotalCalls() + 1);
        if (isError) {
            metric.setTotalErrors(metric.getTotalErrors() + 1);
        }

        // Update average time
        long totalTime = (long) (metric.getAverageTime() * (metric.getTotalCalls() - 1)) + durationMs;
        metric.setAverageTime((double) totalTime / metric.getTotalCalls());

        // Update min/max time
        if (durationMs > metric.getMaxTime()) {
            metric.setMaxTime(durationMs);
        }
        if (metric.getMinTime() == 0 || durationMs < metric.getMinTime()) {
            metric.setMinTime(durationMs);
        }

        // Calculate error rate
        if (metric.getTotalCalls() > 0) {
            metric.setErrorRate((double) metric.getTotalErrors() / metric.getTotalCalls() * 100);
        }
    }

    /**
     * Convert tags to string key
     */
    private String tagsToString(Map<String, String> tags) {
        if (tags == null || tags.isEmpty()) {
            return "";
        }

        return tags.entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .sorted()
                .collect(Collectors.joining(","));
    }

    /**
     * Calculate requests per minute
     */
    private double calculateRequestsPerMinute() {
        // This is a simplified calculation
        // In a real implementation, you'd track requests over time windows
        long totalRequests = counters.values().stream()
                .mapToLong(AtomicLong::get)
                .sum();

        long uptimeMinutes = (System.currentTimeMillis() - getStartTime()) / (1000 * 60);
        return uptimeMinutes > 0 ? (double) totalRequests / uptimeMinutes : 0;
    }

    /**
     * Get application start time
     */
    private long getStartTime() {
        // This would be set when the application starts
        // For now, return a placeholder
        return System.currentTimeMillis() - (24 * 60 * 60 * 1000); // 24 hours ago
    }
}
