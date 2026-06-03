package com.ait.ess.empinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO tổng hợp thông tin cá nhân cho ESS
 */
@Data
@NoArgsConstructor
public class EssPersonalInfoDto {

    // === Từ HR_EMPLOYEE ===
    private String empId;
    private String personId;
    private String localName;
    private String deptName;
    private String dutyName;
    private String positionNoName;
    private String postFamilyName;
    private String postGradeName;
    private String headDepartment;

    private String dateStarted;

    // === Từ HR_PERSONAL_INFO ===
    private String dob;
    private String sexCode;
    private String sexName;
    private String maritalStatusCode;
    private String maritalStatusName;
    private String nationCode;
    private String nationName;
    private String nationalityCode;
    private String nationalityName;
    private String houseTp;
    private String homePhone;
    private String companyPhone;
    private String cellphone;
    private String residentialDistinction;
    private String existSingle;
    private String email;
    private String emailSecond;
    private String singId;
    private String homeAddress;
    private String officePhone;
    private String idcardNo;
}
