package com.ait.hrm.recruitManage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrExpInsideBatchDto {

    // Pagination
    private int draw;
    private int start;
    private int length;

    // HR_RECRUIT_REGISTER_INFO fields
    private String registerSeq;
    private String registerDate;
    private String registerRemark;
    private String registerInfo;
    private String registerCode;
    private String registerActivity;

    // HR_EXPERIENCE_INSIDE_BATCH fields
    private String seq;
    private String empId;
    private String localName;
    private String startDate;
    private String transCode;
    private String transReason;
    private String deptno;
    private String postFamily;
    private String newPostGradeNo;
    private String positionNo;
    private String empTypeCode;
    private String mainBusiness;
    private String costCenter;
    private String remarks;
    private String activity;
    private String lineId;
    private String personId;

    // Display fields (joined)
    private String transCodeName;
    private String transReasonName;
    private String deptName;
    private String postFamilyName;
    private String postGradeName;
    private String positionNoName;
    private String empTypeName;
    private String mainBusinessName;
}
