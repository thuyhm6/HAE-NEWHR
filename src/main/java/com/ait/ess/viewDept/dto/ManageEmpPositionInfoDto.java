package com.ait.ess.viewDept.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManageEmpPositionInfoDto {
    private String empId;
    private String localName;
    private String personId;
    private String personSupplierCompany;
    private String nationalityCode;
    private String nationalityName;
    private String postFamily;
    private String postFamilyName;
    private String empTypeCode;
    private String empTypeName;
    private String dutyNo;
    private String dutyName;
    private String position;
    private String positionName;
    private String positionNoName;
    private String employeeOwned;
    private String deptName;
    private String deptNo;
    private String orgNameLocal;
    private String managerEmpName;
    private String postGradeNo;
    private String mainBusiness;
    private String dateStarted;
    private String managerName;
    private String empOffice;
    private String empOfficeName;
    private String photoPath;

    private String keyword;
    private String deptNos;
    private String fromDate;
    private String toDate;
    private String asOfDate;
}
