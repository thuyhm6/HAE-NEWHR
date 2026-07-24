package com.ait.ess.tempEmp.dto;

import lombok.Data;

@Data
public class MonthDetailListDto {

    // Kết quả truy vấn - Thông tin cơ bản (HR_EMPLOYEE, HR_PERSONAL_INFO, HR_DEPARTMENT)
    private String empId;
    private String localName;
    private String deptName;
    private String dob;
    private String dutyName;
    private String dateStarted;
    private String endProbationDate;

    // Kết quả truy vấn - Dữ liệu chấm công (chờ bổ sung câu lệnh/nguồn dữ liệu sau)
    private Integer hcDayOt;
    private Integer hcNightOt;
    private Integer hcNightOt210;
    private Integer restDayOt;
    private Integer restNightOt;
    private Integer holDayOt;
    private Integer holNightOt;
    private Integer adminShiftDays;
    private Integer nightShiftDays;
    private Integer standardWorkDays;

    // Tham số tìm kiếm
    private String keyword;
    private String quickFilter;
    private String deptNos;
    private String empTypeCode;
    private String month;
    private String year;
    private String reportType;
    private String reportYear;

    // Phân trang
    private int draw;
    private int start;
    private int length;
}
