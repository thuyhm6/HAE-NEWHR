package com.ait.hrm.empinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrExpInsideDto {

    // Pagination
    private int draw;
    private int start;
    private int length;

    // Search employee
    private String searchKeyword;

    // PK
    private Long seq;

    // HR_EXPERIENCE_INSIDE fields
    private String personId;
    private String transCode;
    private String startDate;
    private String deptno;
    private String empTypeCode;
    private String employeeBelong;
    private String empOffice;
    private String endProbationDate;
    private String postGradeNo;
    private String postFamily;
    private String jobType;
    private String dutyNo;
    private String workHourType;
    private String wageType;
    private String remark;
    private String activity;
    private String positionNo;
    private String mainBusiness;
    private String transResource;
    private String costCenter;
    private String payStepNo;
    private String position;

    // Audit
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;

    // Joined display fields
    private String empId;
    private String localName;
    private String deptName;
    private String transCodeName;
    private String empTypeName;
    private String postFamilyName;
    private String postGradeName;

}
