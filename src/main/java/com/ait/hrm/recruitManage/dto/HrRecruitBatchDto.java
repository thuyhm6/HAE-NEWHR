package com.ait.hrm.recruitManage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrRecruitBatchDto {

    // Pagination
    private int draw;
    private int start;
    private int length;

    // HR_RECRUIT_REGISTER_INFO fields
    private String registerSeq;
    private String registerDate;
    private String registerRemark;
    private String registerActivity;

    // HR_EMPLOYEE_RECRUIT_BATCH fields
    private String seq;
    private String empId;
    private String vietnamName;
    private String englishName;
    private String dob;
    private String dateStarted;
    private String endProbationDate;
    private String joinType;
    private String joinDetailType;
    private String deptno;
    private String postGradeNo;
    private String mainBusiness;
    private String postFamily;
    private String empTypeCode;
    private String positionNo;
    private String costCenter;
    private String finalDegreeCode;
    private String endDate;
    private String institutionName;
    private String subjectName;
    private String idcardNo;
    private String idcardSDate;
    private String issuingAuthority;
    private String sexcode;
    private String nationalityCode;
    private String nationCode;
    private String maritalStatusCode;
    private String emailSecond;
    private String homePhone;
    private String telephone;
    private String addressContent;
    private String regPlace;
    private String activity;
    private String lineId;
    private String personId;

    // Display fields (joined from code tables)
    private String joinTypeName;
    private String joinDetailTypeName;
    private String deptName;
    private String postGradeName;
    private String mainBusinessName;
    private String postFamilyName;
    private String empTypeName;
    private String positionNoName;
    private String finalDegreeName;
    private String sexName;
    private String nationalityName;
    private String nationName;
    private String maritalStatusName;
}
