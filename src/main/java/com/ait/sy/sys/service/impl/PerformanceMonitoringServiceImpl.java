package com.ait.sy.sys.service.impl;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ait.sy.sys.service.PerformanceMonitoringService;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * PerformanceMonitoringServiceImpl - Implementation của
 * PerformanceMonitoringService
 */
@Service
public class PerformanceMonitoringServiceImpl implements PerformanceMonitoringService {

    private final MeterRegistry meterRegistry;
    private final ConcurrentHashMap<String, AtomicLong> operationCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, AtomicLong> operationTimes = new ConcurrentHashMap<>();
    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong totalQueryTime = new AtomicLong(0);
    private final AtomicLong totalQueryCount = new AtomicLong(0);
    private final AtomicLong cacheHits = new AtomicLong(0);
    private final AtomicLong cacheMisses = new AtomicLong(0);
    private final AtomicReference<Long> maxResponseTime = new AtomicReference<>(0L);
    private final AtomicReference<Long> minResponseTime = new AtomicReference<>(Long.MAX_VALUE);

    @Autowired
    public PerformanceMonitoringServiceImpl(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Override
    public void recordExecutionTime(String operation, long executionTimeMs) {
        // Update counters
        operationCounts.computeIfAbsent(operation, k -> new AtomicLong(0)).incrementAndGet();
        operationTimes.computeIfAbsent(operation, k -> new AtomicLong(0)).addAndGet(executionTimeMs);
        totalRequests.incrementAndGet();

        // Update min/max response times
        maxResponseTime.updateAndGet(current -> Math.max(current, executionTimeMs));
        minResponseTime.updateAndGet(current -> Math.min(current, executionTimeMs));

        // Record with Micrometer
        Timer.Sample sample = Timer.start(meterRegistry);
        sample.stop(Timer.builder("operation.execution.time")
                .tag("operation", operation)
                .register(meterRegistry));

        // Record response time counter
        Counter.builder("operation.execution.count")
                .tag("operation", operation)
                .register(meterRegistry)
                .increment();
    }

    @Override
    public void recordQueryTime(String queryName, long executionTimeMs) {
        totalQueryCount.incrementAndGet();
        totalQueryTime.addAndGet(executionTimeMs);

        // Record with Micrometer
        Timer.Sample sample = Timer.start(meterRegistry);
        sample.stop(Timer.builder("database.query.time")
                .tag("query", queryName)
                .register(meterRegistry));

        Counter.builder("database.query.count")
                .tag("query", queryName)
                .register(meterRegistry)
                .increment();
    }

    @Override
    public void recordCacheHit(String cacheName, String key) {
        cacheHits.incrementAndGet();

        Counter.builder("cache.hits")
                .tag("cache", cacheName)
                .register(meterRegistry)
                .increment();
    }

    @Override
    public void recordCacheMiss(String cacheName, String key) {
        cacheMisses.incrementAndGet();

        Counter.builder("cache.misses")
                .tag("cache", cacheName)
                .register(meterRegistry)
                .increment();
    }

    @Override
    public void recordActiveUsers(int count) {
        meterRegistry.gauge("active.users", count);
    }

    @Override
    public void recordMemoryUsage() {
        Runtime runtime = Runtime.getRuntime();
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();
        long maxMemory = runtime.maxMemory();

        meterRegistry.gauge("memory.used", usedMemory);
        meterRegistry.gauge("memory.max", maxMemory);
        meterRegistry.gauge("memory.usage.percent", (double) usedMemory / maxMemory * 100);
    }

    @Override
    public PerformanceStats getPerformanceStats() {
        PerformanceStats stats = new PerformanceStats();

        stats.setTotalRequests(totalRequests.get());
        stats.setDatabaseQueryCount(totalQueryCount.get());
        stats.setActiveUsers(getActiveUsersCount());
        stats.setMemoryUsage(getCurrentMemoryUsage());

        // Calculate average response time
        if (totalRequests.get() > 0) {
            long totalTime = operationTimes.values().stream().mapToLong(AtomicLong::get).sum();
            stats.setAverageResponseTime(totalTime / totalRequests.get());
        }

        // Calculate average query time
        if (totalQueryCount.get() > 0) {
            stats.setAverageQueryTime(totalQueryTime.get() / totalQueryCount.get());
        }

        // Calculate cache hit rate
        long totalCacheAccess = cacheHits.get() + cacheMisses.get();
        if (totalCacheAccess > 0) {
            stats.setCacheHitRate((double) cacheHits.get() / totalCacheAccess * 100);
        }

        stats.setMaxResponseTime(maxResponseTime.get());
        stats.setMinResponseTime(minResponseTime.get() == Long.MAX_VALUE ? 0 : minResponseTime.get());

        return stats;
    }

    private int getActiveUsersCount() {
        // TODO: Implement actual active users tracking
        return 0;
    }

    private long getCurrentMemoryUsage() {
        Runtime runtime = Runtime.getRuntime();
        return runtime.totalMemory() - runtime.freeMemory();
    }
}
