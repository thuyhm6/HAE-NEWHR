package com.ait.ess.infoApply.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssOtApplyListDto {
    private String applyNo;
    private String personId;
    private String otTypeCode;
    private String otTypeName;
    private String applyOtDate;
    private String otFromTime;
    private String otToTime;
    private String otApplyHour;
    private String deductYn;
    private String applyOtRemark;
    private String affirmFlag;
    private String affirmFlagName;
    private String confirmFlag;
    private String confirmFlagName;
    private String createdBy;
    private String createdIp;

    // Search params
    private String otTypeCodeSearch;
    private String affirmFlagSearch;
    private String fromDate;
    private String toDate;
}
