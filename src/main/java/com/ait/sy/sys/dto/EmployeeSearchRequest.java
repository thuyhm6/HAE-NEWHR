package com.ait.sy.sys.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EmployeeSearchRequest {
    @JsonProperty("empCode")
    private String empCode;

    @JsonProperty("empName")
    private String empName;

    @JsonProperty("department")
    private String department;

    @JsonProperty("page")
    private int page = 0;

    @JsonProperty("size")
    private int size = 10;

    // Constructors
    public EmployeeSearchRequest() {
    }

    public EmployeeSearchRequest(String empCode, String empName, String department, int page, int size) {
        this.empCode = empCode;
        this.empName = empName;
        this.department = department;
        this.page = page;
        this.size = size;
    }

    // Getters and Setters
    public String getEmpCode() {
        return empCode;
    }

    public void setEmpCode(String empCode) {
        this.empCode = empCode;
    }

    public String getEmpName() {
        return empName;
    }

    public void setEmpName(String empName) {
        this.empName = empName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    @Override
    public String toString() {
        return "EmployeeSearchRequest{" +
                "empCode='" + empCode + '\'' +
                ", empName='" + empName + '\'' +
                ", department='" + department + '\'' +
                ", page=" + page +
                ", size=" + size +
                '}';
    }
}
