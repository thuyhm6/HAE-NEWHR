package com.ait.ar.attendanceMintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArAttendanceSearchDto {
    private Long pkNo;
    private String personId;
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;
    private String postGradeNo;
    private String postGradeName;
    private String postFamily;
    private String postFamilyName;

    private String arDateStr;
    private String arMonthStr;
    private String fromTime;
    private String toTime;
    private String quantity;
    private String unit;
    private String dateType;
    private String itemNo;
    private String itemName;
    private String shiftNo;
    private String shiftName;
    private String statusCode;
    private String statusName;
    private String remark;

    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;
    private String activity;
    private String orderNo;

    private String keyword;
    private String deptNos;
    private String fromDate;
    private String toDate;
}
