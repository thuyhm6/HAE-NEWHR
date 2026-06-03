package com.ait.ar.attendanceMintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssLeaveApplyImportTempDto {
    private String deptNo;
    private String deptName;
    private String empId;
    private String applyName;
    private String leaveTypeCode;
    private String leaveTypeName;
    private String leaveFromDate;
    private String leaveFromTime;
    private String leaveToDate;
    private String leaveToTime;
    private String applyLength;
    private String leaveReason;
    private String affirmFlag;
    private String affirmFlagName;
    private String uploadBy;
    private String uploadDate;
    private String cpnyId;
    private String lineId;
    private String uploadErrorMsg;
    private String resultFlag;
}
