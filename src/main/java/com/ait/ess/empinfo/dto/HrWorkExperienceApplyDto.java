package com.ait.ess.empinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class HrWorkExperienceApplyDto {

    private Long workExperNo;
    private String personId;
    private String cpnyName;
    private String deptName;
    private String position;
    private String duty;
    private BigDecimal payroll;
    private String resignReason;
    private String witness;
    private String tel;
    private BigDecimal ageLimit;
    private String workAddress;
    private String seniorityResponse;
    private Integer activity;
    private String nationality;
    private String enPositionName;
    private String oldId;
    private String payYear;
    private Integer applyType;
    private Long updateWorkExperNo;
    private String essTypeCode;
    private String remark;
    private String overseas;
    private String callback;
    private String earror;
    private String endMonth;
    private String startMonth;
    private String startDate;
    private String endDate;
    private Long orderno;
}
