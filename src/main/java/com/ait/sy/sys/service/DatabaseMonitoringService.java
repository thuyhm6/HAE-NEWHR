package com.ait.sy.sys.service;

import java.util.List;

/**
 * DatabaseMonitoringService - Service để monitor database performance
 */
public interface DatabaseMonitoringService {

    /**
     * Lấy thông tin connection pool
     */
    DatabaseConnectionInfo getConnectionPoolInfo();

    /**
     * Lấy danh sách slow queries
     */
    List<SlowQueryInfo> getSlowQueries(int limit);

    /**
     * Lấy thông tin table statistics
     */
    List<TableStatistics> getTableStatistics();

    /**
     * Lấy thông tin index usage
     */
    List<IndexUsageInfo> getIndexUsage();

    /**
     * Lấy database health status
     */
    DatabaseHealthStatus getDatabaseHealth();

    /**
     * Lấy thông tin database session
     */
    List<DatabaseSession> getActiveSessions();

    /**
     * Lấy thông tin database locks
     */
    List<DatabaseLock> getDatabaseLocks();

    /**
     * Refresh database statistics
     */
    void refreshDatabaseStatistics();

    /**
     * Database connection information
     */
    class DatabaseConnectionInfo {
        private int activeConnections;
        private int idleConnections;
        private int maxConnections;
        private long connectionWaitTime;
        private int connectionLeaks;

        // Getters and Setters
        public int getActiveConnections() {
            return activeConnections;
        }

        public void setActiveConnections(int activeConnections) {
            this.activeConnections = activeConnections;
        }

        public int getIdleConnections() {
            return idleConnections;
        }

        public void setIdleConnections(int idleConnections) {
            this.idleConnections = idleConnections;
        }

        public int getMaxConnections() {
            return maxConnections;
        }

        public void setMaxConnections(int maxConnections) {
            this.maxConnections = maxConnections;
        }

        public long getConnectionWaitTime() {
            return connectionWaitTime;
        }

        public void setConnectionWaitTime(long connectionWaitTime) {
            this.connectionWaitTime = connectionWaitTime;
        }

        public int getConnectionLeaks() {
            return connectionLeaks;
        }

        public void setConnectionLeaks(int connectionLeaks) {
            this.connectionLeaks = connectionLeaks;
        }
    }

    /**
     * Slow query information
     */
    class SlowQueryInfo {
        private String sqlId;
        private String sqlText;
        private long executions;
        private long elapsedTime;
        private double avgElapsedTime;
        private long cpuTime;
        private long diskReads;
        private long bufferGets;
        private long rowsProcessed;

        // Getters and Setters
        public String getSqlId() {
            return sqlId;
        }

        public void setSqlId(String sqlId) {
            this.sqlId = sqlId;
        }

        public String getSqlText() {
            return sqlText;
        }

        public void setSqlText(String sqlText) {
            this.sqlText = sqlText;
        }

        public long getExecutions() {
            return executions;
        }

        public void setExecutions(long executions) {
            this.executions = executions;
        }

        public long getElapsedTime() {
            return elapsedTime;
        }

        public void setElapsedTime(long elapsedTime) {
            this.elapsedTime = elapsedTime;
        }

        public double getAvgElapsedTime() {
            return avgElapsedTime;
        }

        public void setAvgElapsedTime(double avgElapsedTime) {
            this.avgElapsedTime = avgElapsedTime;
        }

        public long getCpuTime() {
            return cpuTime;
        }

        public void setCpuTime(long cpuTime) {
            this.cpuTime = cpuTime;
        }

        public long getDiskReads() {
            return diskReads;
        }

        public void setDiskReads(long diskReads) {
            this.diskReads = diskReads;
        }

        public long getBufferGets() {
            return bufferGets;
        }

        public void setBufferGets(long bufferGets) {
            this.bufferGets = bufferGets;
        }

        public long getRowsProcessed() {
            return rowsProcessed;
        }

        public void setRowsProcessed(long rowsProcessed) {
            this.rowsProcessed = rowsProcessed;
        }
    }

    /**
     * Table statistics
     */
    class TableStatistics {
        private String tableName;
        private long numRows;
        private long blocks;
        private double avgRowLength;
        private java.util.Date lastAnalyzed;
        private long sampleSize;

        // Getters and Setters
        public String getTableName() {
            return tableName;
        }

        public void setTableName(String tableName) {
            this.tableName = tableName;
        }

        public long getNumRows() {
            return numRows;
        }

        public void setNumRows(long numRows) {
            this.numRows = numRows;
        }

        public long getBlocks() {
            return blocks;
        }

        public void setBlocks(long blocks) {
            this.blocks = blocks;
        }

        public double getAvgRowLength() {
            return avgRowLength;
        }

        public void setAvgRowLength(double avgRowLength) {
            this.avgRowLength = avgRowLength;
        }

        public java.util.Date getLastAnalyzed() {
            return lastAnalyzed;
        }

        public void setLastAnalyzed(java.util.Date lastAnalyzed) {
            this.lastAnalyzed = lastAnalyzed;
        }

        public long getSampleSize() {
            return sampleSize;
        }

        public void setSampleSize(long sampleSize) {
            this.sampleSize = sampleSize;
        }
    }

    /**
     * Index usage information
     */
    class IndexUsageInfo {
        private String indexName;
        private String tableName;
        private long numRows;
        private long distinctKeys;
        private double clusteringFactor;
        private boolean isUsed;

        // Getters and Setters
        public String getIndexName() {
            return indexName;
        }

        public void setIndexName(String indexName) {
            this.indexName = indexName;
        }

        public String getTableName() {
            return tableName;
        }

        public void setTableName(String tableName) {
            this.tableName = tableName;
        }

        public long getNumRows() {
            return numRows;
        }

        public void setNumRows(long numRows) {
            this.numRows = numRows;
        }

        public long getDistinctKeys() {
            return distinctKeys;
        }

        public void setDistinctKeys(long distinctKeys) {
            this.distinctKeys = distinctKeys;
        }

        public double getClusteringFactor() {
            return clusteringFactor;
        }

        public void setClusteringFactor(double clusteringFactor) {
            this.clusteringFactor = clusteringFactor;
        }

        public boolean isUsed() {
            return isUsed;
        }

        public void setUsed(boolean used) {
            isUsed = used;
        }
    }

    /**
     * Database health status
     */
    class DatabaseHealthStatus {
        private boolean isHealthy;
        private String status;
        private double cpuUsage;
        private double memoryUsage;
        private long activeSessions;
        private long longRunningQueries;
        private String issues;

        // Getters and Setters
        public boolean isHealthy() {
            return isHealthy;
        }

        public void setHealthy(boolean healthy) {
            isHealthy = healthy;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public double getCpuUsage() {
            return cpuUsage;
        }

        public void setCpuUsage(double cpuUsage) {
            this.cpuUsage = cpuUsage;
        }

        public double getMemoryUsage() {
            return memoryUsage;
        }

        public void setMemoryUsage(double memoryUsage) {
            this.memoryUsage = memoryUsage;
        }

        public long getActiveSessions() {
            return activeSessions;
        }

        public void setActiveSessions(long activeSessions) {
            this.activeSessions = activeSessions;
        }

        public long getLongRunningQueries() {
            return longRunningQueries;
        }

        public void setLongRunningQueries(long longRunningQueries) {
            this.longRunningQueries = longRunningQueries;
        }

        public String getIssues() {
            return issues;
        }

        public void setIssues(String issues) {
            this.issues = issues;
        }
    }

    /**
     * Database session information
     */
    class DatabaseSession {
        private String sessionId;
        private String username;
        private String program;
        private String status;
        private long elapsedTime;
        private String sqlText;

        // Getters and Setters
        public String getSessionId() {
            return sessionId;
        }

        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getProgram() {
            return program;
        }

        public void setProgram(String program) {
            this.program = program;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public long getElapsedTime() {
            return elapsedTime;
        }

        public void setElapsedTime(long elapsedTime) {
            this.elapsedTime = elapsedTime;
        }

        public String getSqlText() {
            return sqlText;
        }

        public void setSqlText(String sqlText) {
            this.sqlText = sqlText;
        }
    }

    /**
     * Database lock information
     */
    class DatabaseLock {
        private String lockType;
        private String tableName;
        private String sessionId;
        private String username;
        private String status;
        private long waitTime;

        // Getters and Setters
        public String getLockType() {
            return lockType;
        }

        public void setLockType(String lockType) {
            this.lockType = lockType;
        }

        public String getTableName() {
            return tableName;
        }

        public void setTableName(String tableName) {
            this.tableName = tableName;
        }

        public String getSessionId() {
            return sessionId;
        }

        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public long getWaitTime() {
            return waitTime;
        }

        public void setWaitTime(long waitTime) {
            this.waitTime = waitTime;
        }
    }
}
