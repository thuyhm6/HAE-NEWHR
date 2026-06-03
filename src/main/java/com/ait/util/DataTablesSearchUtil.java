package com.ait.util;

import java.util.Map;

import com.ait.sy.sys.dto.DataTablesRequest;

/**
 * Utility class for handling DataTables search parameters
 * Provides methods to work with generic search parameters
 */
public class DataTablesSearchUtil {

    /**
     * Add search parameter to DataTablesRequest
     */
    public static void addSearchParam(DataTablesRequest request, String key, Object value) {
        if (value != null && !value.toString().trim().isEmpty()) {
            request.addSearchParam(key, value);
        }
    }

    /**
     * Get search parameter as string
     */
    public static String getSearchParam(DataTablesRequest request, String key) {
        return request.getSearchParamAsString(key);
    }

    /**
     * Check if search parameter exists and is not empty
     */
    public static boolean hasSearchParam(DataTablesRequest request, String key) {
        String value = getSearchParam(request, key);
        return value != null && !value.trim().isEmpty();
    }

    /**
     * Get search parameter with default value
     */
    public static String getSearchParam(DataTablesRequest request, String key, String defaultValue) {
        String value = getSearchParam(request, key);
        return value != null && !value.trim().isEmpty() ? value : defaultValue;
    }

    /**
     * Build search parameters map for MyBatis
     */
    public static Map<String, Object> buildSearchParamsMap(DataTablesRequest request) {
        return request.getSearchParams();
    }

    /**
     * Add common search parameters for employee-related searches
     */
    public static void addEmployeeSearchParams(DataTablesRequest request,
            String empName, String empCode,
            String department, String position) {
        addSearchParam(request, "empName", empName);
        addSearchParam(request, "empCode", empCode);
        addSearchParam(request, "department", department);
        addSearchParam(request, "position", position);
    }

    /**
     * Add common search parameters for contract-related searches
     */
    public static void addContractSearchParams(DataTablesRequest request,
            String contractNo, String personId, String contractType,
            String workPosition, String startDateFrom, String startDateTo,
            String endDateFrom, String endDateTo, String activity,
            String salaryFrom, String salaryTo) {
        addSearchParam(request, "contractNo", contractNo);
        addSearchParam(request, "personId", personId);
        addSearchParam(request, "contractType", contractType);
        addSearchParam(request, "workPosition", workPosition);
        addSearchParam(request, "startDateFrom", startDateFrom);
        addSearchParam(request, "startDateTo", startDateTo);
        addSearchParam(request, "endDateFrom", endDateFrom);
        addSearchParam(request, "endDateTo", endDateTo);
        addSearchParam(request, "activity", activity);
        addSearchParam(request, "salaryFrom", salaryFrom);
        addSearchParam(request, "salaryTo", salaryTo);
    }

    /**
     * Add date range search parameters
     */
    public static void addDateRangeSearchParams(DataTablesRequest request,
            String dateFromKey, String dateToKey,
            String dateFrom, String dateTo) {
        addSearchParam(request, dateFromKey, dateFrom);
        addSearchParam(request, dateToKey, dateTo);
    }

    /**
     * Add numeric range search parameters
     */
    public static void addNumericRangeSearchParams(DataTablesRequest request,
            String fromKey, String toKey,
            String fromValue, String toValue) {
        addSearchParam(request, fromKey, fromValue);
        addSearchParam(request, toKey, toValue);
    }

    /**
     * Check if any search parameters exist
     */
    public static boolean hasAnySearchParams(DataTablesRequest request) {
        Map<String, Object> params = request.getSearchParams();
        return params != null && !params.isEmpty();
    }

    /**
     * Clear all search parameters
     */
    public static void clearSearchParams(DataTablesRequest request) {
        if (request.getSearchParams() != null) {
            request.getSearchParams().clear();
        }
    }
}
