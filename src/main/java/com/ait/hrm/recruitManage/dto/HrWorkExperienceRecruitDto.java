package com.ait.hrm.recruitManage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrWorkExperienceRecruitDto {

    private Long seq;
    private String personId;
    private String cpnyName;
    private String deptName;
    private String startDate;
    private String endDate;
    private String position;
    private String positionEng;
    private String payroll;
    private String remark;
    private String leftReason;
    private String contactPhone;
    private String witness;
    private String cpnyAddress;
    private String duty;
    private String activity;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;

    // Display
    private String localName;
    private String empId;
}
