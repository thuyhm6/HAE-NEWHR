package com.ait.hrm.recruitManage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrFamilyRecruitDto {

    private Long seq;
    private String personId;
    private String famName;
    private String famTypeCode;
    private String gender;
    private String famBorndate;
    private String emergencyContactYn;
    private String famAddress;
    private String famFamilyPhone;
    private String famEmail;
    private String famPhone;
    private String workPhone;
    private String welfareType;
    private String remark;
    private String childrenCode;
    private String occupation;
    private String country;
    private String diploma;
    private String workUnit;
    private String age;
    private String activity;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;

    // Display
    private String famTypeName;
    private String genderName;
    private String localName;
    private String empId;
}
