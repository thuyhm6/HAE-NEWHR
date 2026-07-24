package com.ait.ess.viewDept.dto;

import lombok.Data;

@Data
public class ManageCountInfoEmpDto {

    // Kết quả truy vấn
    private String empId;
    private String localName;
    private String deptName;
    private String postFamilyName;
    private String postGradeNo;
    private String empTypeName;
    private String dob;
    private String sexName;
    private String dateStarted;
    private String empOfficeName;

    // Tham số tìm kiếm
    private String keyword;
    private String deptNos;
    private String postFamily;
    private String empTypeCode;
    private String empOffice;
    private String asOfDate;

    // Phân trang
    private int draw;
    private int start;
    private int length;
}
