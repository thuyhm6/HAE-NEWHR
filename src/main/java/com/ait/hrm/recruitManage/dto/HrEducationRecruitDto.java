package com.ait.hrm.recruitManage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrEducationRecruitDto {

    private Long seq;
    private String personId;
    private String degreeCode;
    private String finalDegreeWhether;
    private String degreesCode;
    private String institutionName;
    private String subject;
    private String startDate;
    private String endDate;
    private String schoolLength;
    private String thesisNameLocal;
    private String thesisNameEng;
    private String subjectSecond;
    private String eduDegNum;
    private String siteCountry;
    private String experienceStudyAbroad;
    private String address;
    private String remark;
    private String activity;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;

    // Display
    private String degreeName;
    private String degreesName;
    private String localName;
    private String empId;
}
