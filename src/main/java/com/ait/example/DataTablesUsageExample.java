package com.ait.example;

import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.util.DataTablesSearchUtil;

/**
 * Example class showing how to use the optimized DataTablesRequest
 * for different models without modifying the base class
 */
public class DataTablesUsageExample {

    /**
     * Example: Using DataTablesRequest for Contract model
     */
    public void contractSearchExample() {
        DataTablesRequest request = new DataTablesRequest();

        // Add contract-specific search parameters
        DataTablesSearchUtil.addContractSearchParams(request,
                "CT001", // contractNo
                "EMP001", // personId
                "FULL_TIME", // contractType
                "Developer", // workPosition
                "2024-01-01", // startDateFrom
                "2024-12-31", // startDateTo
                "2024-01-01", // endDateFrom
                "2024-12-31", // endDateTo
                "ACTIVE", // activity
                "10000000", // salaryFrom
                "50000000" // salaryTo
        );

        // Add additional parameters
        DataTablesSearchUtil.addSearchParam(request, "department", "IT");
        DataTablesSearchUtil.addSearchParam(request, "status", "APPROVED");
    }

    /**
     * Example: Using DataTablesRequest for Employee model
     */
    public void employeeSearchExample() {
        DataTablesRequest request = new DataTablesRequest();

        // Add employee-specific search parameters
        DataTablesSearchUtil.addEmployeeSearchParams(request,
                "John Doe", // empName
                "EMP001", // empCode
                "IT", // department
                "Developer" // position
        );

        // Add additional parameters
        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "hireDateFrom", "hireDateTo",
                "2024-01-01", "2024-12-31");

        DataTablesSearchUtil.addNumericRangeSearchParams(request,
                "ageFrom", "ageTo",
                "25", "65");
    }

    /**
     * Example: Using DataTablesRequest for any new model
     */
    public void newModelSearchExample() {
        DataTablesRequest request = new DataTablesRequest();

        // Add any search parameters for new model
        DataTablesSearchUtil.addSearchParam(request, "modelName", "Product");
        DataTablesSearchUtil.addSearchParam(request, "category", "Electronics");
        DataTablesSearchUtil.addSearchParam(request, "priceMin", "100000");
        DataTablesSearchUtil.addSearchParam(request, "priceMax", "1000000");
        DataTablesSearchUtil.addSearchParam(request, "status", "ACTIVE");

        // Add date range
        DataTablesSearchUtil.addDateRangeSearchParams(request,
                "createdDateFrom", "createdDateTo",
                "2024-01-01", "2024-12-31");
    }

    /**
     * Example: Checking search parameters
     */
    public void checkSearchParamsExample(DataTablesRequest request) {
        // Check if specific parameter exists
        if (DataTablesSearchUtil.hasSearchParam(request, "contractNo")) {
            String contractNo = DataTablesSearchUtil.getSearchParam(request, "contractNo");
            System.out.println("Contract No: " + contractNo);
        }

        // Get parameter with default value
        String status = DataTablesSearchUtil.getSearchParam(request, "status", "ACTIVE");
        System.out.println("Status: " + status);

        // Check if any search parameters exist
        if (DataTablesSearchUtil.hasAnySearchParams(request)) {
            System.out.println("Search parameters found");
        }
    }

    /**
     * Example: Building search parameters for MyBatis
     */
    public void mybatisSearchExample(DataTablesRequest request) {
        // The searchParams map can be directly used in MyBatis XML
        // No need to modify DataTablesRequest for new models

        // In MyBatis XML, you can access parameters like:
        // #{searchParams.contractNo}
        // #{searchParams.empName}
        // #{searchParams.anyNewField}

        // The mapper will automatically handle the dynamic SQL based on
        // which parameters are present in the searchParams map
    }
}
