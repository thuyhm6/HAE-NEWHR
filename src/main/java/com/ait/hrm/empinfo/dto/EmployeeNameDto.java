package com.ait.hrm.empinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeNameDto {
    private String personId;
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;   
    private String positionNo;
    private String positionNoName; 
    private String postGradeNo;
    private String postGradeName;
    private String empTypeCode;
    private String empTypeName;
    private String mainBusinessNo;
    private String mainBusinessName;
    private String dutyNo;
    private String dutyName;
    private String postNo;
    private String postName;
    private String statusCodeNo;
    private String statusCodeName;
    private String shiftNo;
    private String shiftName;
    private String empOffice;
    private String empOfficeName;
    private String postFamily;
    private String postFamilyName;
    private String workHourType;
    private String workHourTypeName;
    private String position;
    private String positionName;

    //HrPersonalInfo
    private String nationName;
    private String nationalityName;
    private String maritalStatusName;
    private String regTypeName;
}
