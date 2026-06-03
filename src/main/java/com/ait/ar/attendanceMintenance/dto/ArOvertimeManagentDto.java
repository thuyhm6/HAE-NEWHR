package com.ait.ar.attendanceMintenance.dto;

import com.ait.hrm.empinfo.dto.EmployeeNameDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ArOvertimeManagentDto extends EmployeeNameDto {
    private String applyNo;
    private String personId;
    private String applyOtDate;
    private String otFromTime;
    private String otToTime;
    private String applyOtRemark;
    private String otTypeNo;
    private String otTypeCode;
    private String otTypeName;
    private String otApplyHour;
    private String affirmFlag;
    private String confirmFlag;
    private String createDate;
    private String createdBy;
    private String createdIp;
    private String updateDate;
    private String updatedBy;
    private String updatedIp;
    private String activity;
    private String applyTime;
    private String confirmDate;
    private String confirmBy;
    private String confirmIp;
    private String cpnyId;
    private String batchYn;
    private String batchNo;
    private String deductYn;
    private String specialYn;
    private String offsetYn;
    private String adjustYn;
    private String affirmStr;
    private String affirmFlagName;
    private String detailFromDateTime;
    private String detailToDateTime;
    private String fromDate;
    private String toDate;
    private String indoorTime;
    private String outdoorTime;
    private String otTotalMonth;
    private String otTotalYear;
    private List<String> applyNos;
}
