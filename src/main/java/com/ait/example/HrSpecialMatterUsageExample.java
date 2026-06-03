package com.ait.example;

import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.util.DataTablesSearchUtil;

/**
 * Example class showing how to use the optimized HrSpecialMatter
 * with generic search parameters
 */
public class HrSpecialMatterUsageExample {

    /**
     * Example: Using HrSpecialMatter with generic search parameters
     */
    public void hrSpecialMatterSearchExample() {
        DataTablesRequest request = new DataTablesRequest();

        // Add HrSpecialMatter-specific search parameters
        DataTablesSearchUtil.addEmployeeSearchParams(request,
                "Nguyen Thi A", // empName
                "EMP001", // empCode
                "IT", // department
                "Developer" // position
        );

        // Add date range for create date
        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "createDateFrom", "createDateTo",
                "2024-01-01", "2024-12-31");

        // Add specific HrSpecialMatter fields
        DataTablesSearchUtil.addSearchParam(request, "activity", "ACTIVE");
        DataTablesSearchUtil.addSearchParam(request, "otFlag", "Y");
        DataTablesSearchUtil.addSearchParam(request, "specialContent", "Maternity Leave");

        // Add date range for special matter period
        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "startDateFrom", "startDateTo",
                "2024-06-01", "2024-12-31");
    }

    /**
     * Example: Using HrSpecialMatter with advanced search
     */
    public void advancedHrSpecialMatterSearchExample() {
        DataTablesRequest request = new DataTablesRequest();

        // Basic employee info
        DataTablesSearchUtil.addSearchParam(request, "empName", "Nguyen");
        DataTablesSearchUtil.addSearchParam(request, "department", "HR");

        // Special matter specific fields
        DataTablesSearchUtil.addSearchParam(request, "activity", "ACTIVE");
        DataTablesSearchUtil.addSearchParam(request, "otFlag", "N");
        DataTablesSearchUtil.addSearchParam(request, "generationTitle", "Leave");

        // Date ranges
        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "createDateFrom", "createDateTo",
                "2024-01-01", "2024-12-31");

        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "startDateFrom", "startDateTo",
                "2024-06-01", "2024-12-31");

        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "endDateFrom", "endDateTo",
                "2024-07-01", "2024-12-31");
    }

    /**
     * Example: Using HrSpecialMatter with minimal search
     */
    public void minimalHrSpecialMatterSearchExample() {
        DataTablesRequest request = new DataTablesRequest();

        // Only search by activity status
        DataTablesSearchUtil.addSearchParam(request, "activity", "ACTIVE");

        // This will return all active special matters
    }

    /**
     * Example: Using HrSpecialMatter with complex search
     */
    public void complexHrSpecialMatterSearchExample() {
        DataTablesRequest request = new DataTablesRequest();

        // Employee information
        DataTablesSearchUtil.addSearchParam(request, "empName", "Nguyen");
        DataTablesSearchUtil.addSearchParam(request, "empCode", "EMP");
        DataTablesSearchUtil.addSearchParam(request, "department", "IT");
        DataTablesSearchUtil.addSearchParam(request, "position", "Senior");

        // Special matter information
        DataTablesSearchUtil.addSearchParam(request, "activity", "ACTIVE");
        DataTablesSearchUtil.addSearchParam(request, "otFlag", "Y");
        DataTablesSearchUtil.addSearchParam(request, "specialContent", "Training");
        DataTablesSearchUtil.addSearchParam(request, "generationTitle", "Professional Development");

        // Date ranges
        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "createDateFrom", "createDateTo",
                "2024-01-01", "2024-12-31");

        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "startDateFrom", "startDateTo",
                "2024-06-01", "2024-12-31");

        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "endDateFrom", "endDateTo",
                "2024-07-01", "2024-12-31");

        // Registration date range
        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "registrationDateFrom", "registrationDateTo",
                "2024-01-01", "2024-12-31");
    }

    /**
     * Example: Checking search parameters for HrSpecialMatter
     */
    public void checkHrSpecialMatterSearchParams(DataTablesRequest request) {
        // Check employee fields
        if (DataTablesSearchUtil.hasSearchParam(request, "empName")) {
            String empName = DataTablesSearchUtil.getSearchParam(request, "empName");
            System.out.println("Employee Name: " + empName);
        }

        if (DataTablesSearchUtil.hasSearchParam(request, "department")) {
            String department = DataTablesSearchUtil.getSearchParam(request, "department");
            System.out.println("Department: " + department);
        }

        // Check special matter fields
        if (DataTablesSearchUtil.hasSearchParam(request, "activity")) {
            String activity = DataTablesSearchUtil.getSearchParam(request, "activity");
            System.out.println("Activity: " + activity);
        }

        if (DataTablesSearchUtil.hasSearchParam(request, "otFlag")) {
            String otFlag = DataTablesSearchUtil.getSearchParam(request, "otFlag");
            System.out.println("OT Flag: " + otFlag);
        }

        // Check date ranges
        if (DataTablesSearchUtil.hasSearchParam(request, "createDateFrom")) {
            String createDateFrom = DataTablesSearchUtil.getSearchParam(request, "createDateFrom");
            System.out.println("Create Date From: " + createDateFrom);
        }

        if (DataTablesSearchUtil.hasSearchParam(request, "startDateFrom")) {
            String startDateFrom = DataTablesSearchUtil.getSearchParam(request, "startDateFrom");
            System.out.println("Start Date From: " + startDateFrom);
        }
    }

    /**
     * Example: Building search parameters for MyBatis XML
     */
    public void mybatisHrSpecialMatterSearchExample(DataTablesRequest request) {
        // The searchParams map can be directly used in MyBatis XML
        // No need to modify DataTablesRequest for new HrSpecialMatter fields

        // In MyBatis XML, you can access parameters like:
        // #{searchParams.empName}
        // #{searchParams.activity}
        // #{searchParams.createDateFrom}
        // #{searchParams.anyNewField}

        // The mapper will automatically handle the dynamic SQL based on
        // which parameters are present in the searchParams map
    }
}
