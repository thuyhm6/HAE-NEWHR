package com.ait.util;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * QueryOptimizationUtil - Utility để tối ưu hóa queries
 */
@Component
public class QueryOptimizationUtil {

    /**
     * Tạo IN clause cho batch queries
     */
    public String buildInClause(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "()";
        }

        StringBuilder sb = new StringBuilder("(");
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) {
                sb.append(",");
            }
            sb.append("'").append(values.get(i)).append("'");
        }
        sb.append(")");
        return sb.toString();
    }

    /**
     * Tạo IN clause với parameter binding
     */
    public String buildInClauseWithParams(List<String> values, String paramPrefix) {
        if (values == null || values.isEmpty()) {
            return "()";
        }

        StringBuilder sb = new StringBuilder("(");
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) {
                sb.append(",");
            }
            sb.append("#{").append(paramPrefix).append("[").append(i).append("]}");
        }
        sb.append(")");
        return sb.toString();
    }

    /**
     * Validate query parameters
     */
    public boolean isValidQueryParams(Map<String, Object> params) {
        if (params == null) {
            return false;
        }

        // Check for SQL injection patterns
        for (Object value : params.values()) {
            if (value instanceof String) {
                String strValue = (String) value;
                if (containsSqlInjection(strValue)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Check for SQL injection patterns
     */
    private boolean containsSqlInjection(String value) {
        if (value == null) {
            return false;
        }

        String lowerValue = value.toLowerCase();
        String[] dangerousPatterns = {
                "'", "\"", ";", "--", "/*", "*/", "xp_", "sp_",
                "union", "select", "insert", "update", "delete", "drop", "create", "alter",
                "exec", "execute", "script", "javascript", "vbscript"
        };

        for (String pattern : dangerousPatterns) {
            if (lowerValue.contains(pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Build pagination query
     */
    public String buildPaginationQuery(String baseQuery, int offset, int limit) {
        return baseQuery + " OFFSET " + offset + " ROWS FETCH NEXT " + limit + " ROWS ONLY";
    }

    /**
     * Build ORDER BY clause
     */
    public String buildOrderByClause(String column, String direction) {
        if (column == null || column.trim().isEmpty()) {
            return "";
        }

        String dir = "ASC";
        if ("DESC".equalsIgnoreCase(direction)) {
            dir = "DESC";
        }

        return " ORDER BY " + column + " " + dir;
    }

    /**
     * Build WHERE clause với AND conditions
     */
    public String buildWhereClause(Map<String, Object> conditions) {
        if (conditions == null || conditions.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder(" WHERE ");
        boolean first = true;

        for (Map.Entry<String, Object> entry : conditions.entrySet()) {
            if (!first) {
                sb.append(" AND ");
            }

            String column = entry.getKey();
            Object value = entry.getValue();

            if (value instanceof String) {
                sb.append(column).append(" = '").append(value).append("'");
            } else {
                sb.append(column).append(" = ").append(value);
            }

            first = false;
        }

        return sb.toString();
    }

    /**
     * Optimize query for Oracle database
     */
    public String optimizeForOracle(String query) {
        if (query == null) {
            return query;
        }

        // Replace LIMIT with Oracle syntax
        query = query.replaceAll("LIMIT\\s+(\\d+)", "ROWNUM <= $1");

        // Add hints for better performance
        if (query.toUpperCase().contains("SELECT")) {
            query = query.replaceFirst("(?i)SELECT", "SELECT /*+ FIRST_ROWS(10) */");
        }

        return query;
    }
}
