package com.ait.sy.sys.service;

/**
 * PerformanceMonitoringService - Service để monitor performance metrics
 */
public interface PerformanceMonitoringService {

    /**
     * Record execution time cho một operation
     */
    void recordExecutionTime(String operation, long executionTimeMs);

    /**
     * Record database query time
     */
    void recordQueryTime(String queryName, long executionTimeMs);

    /**
     * Record cache hit/miss
     */
    void recordCacheHit(String cacheName, String key);

    /**
     * Record cache miss
     */
    void recordCacheMiss(String cacheName, String key);

    /**
     * Record active users count
     */
    void recordActiveUsers(int count);

    /**
     * Record memory usage
     */
    void recordMemoryUsage();

    /**
     * Get performance statistics
     */
    PerformanceStats getPerformanceStats();

    /**
     * Performance statistics class
     */
    class PerformanceStats {
        private long totalRequests;
        private long averageResponseTime;
        private long maxResponseTime;
        private long minResponseTime;
        private double cacheHitRate;
        private int activeUsers;
        private long memoryUsage;
        private long databaseQueryCount;
        private long averageQueryTime;

        // Getters and Setters
        public long getTotalRequests() {
            return totalRequests;
        }

        public void setTotalRequests(long totalRequests) {
            this.totalRequests = totalRequests;
        }

        public long getAverageResponseTime() {
            return averageResponseTime;
        }

        public void setAverageResponseTime(long averageResponseTime) {
            this.averageResponseTime = averageResponseTime;
        }

        public long getMaxResponseTime() {
            return maxResponseTime;
        }

        public void setMaxResponseTime(long maxResponseTime) {
            this.maxResponseTime = maxResponseTime;
        }

        public long getMinResponseTime() {
            return minResponseTime;
        }

        public void setMinResponseTime(long minResponseTime) {
            this.minResponseTime = minResponseTime;
        }

        public double getCacheHitRate() {
            return cacheHitRate;
        }

        public void setCacheHitRate(double cacheHitRate) {
            this.cacheHitRate = cacheHitRate;
        }

        public int getActiveUsers() {
            return activeUsers;
        }

        public void setActiveUsers(int activeUsers) {
            this.activeUsers = activeUsers;
        }

        public long getMemoryUsage() {
            return memoryUsage;
        }

        public void setMemoryUsage(long memoryUsage) {
            this.memoryUsage = memoryUsage;
        }

        public long getDatabaseQueryCount() {
            return databaseQueryCount;
        }

        public void setDatabaseQueryCount(long databaseQueryCount) {
            this.databaseQueryCount = databaseQueryCount;
        }

        public long getAverageQueryTime() {
            return averageQueryTime;
        }

        public void setAverageQueryTime(long averageQueryTime) {
            this.averageQueryTime = averageQueryTime;
        }
    }
}
