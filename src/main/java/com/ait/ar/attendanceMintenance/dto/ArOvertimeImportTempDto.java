package com.ait.ar.attendanceMintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArOvertimeImportTempDto {
    private String deptNo;
    private String deptName;
    private String empId;
    private String applyName;
    private String applyOtDate;
    private String otFromDate;
    private String otFromTime;
    private String otToDate;
    private String otToTime;
    private String otApplyHour;
    private String applyOtRemark;
    private String affirmFlag;
    private String affirmFlagName;
    private String otTotalMonth;
    private String otLimit;
    private String uploadBy;
    private String uploadDate;
    private String cpnyId;
    private String lineId;
    private String uploadErrorMsg;
    private String resultFlag;
    private String otTypeCode;
    private String otTypeName;
    private String adjustYn;
    private String specialYn;
    private String offsetYn;
    private String deductYn;
}
