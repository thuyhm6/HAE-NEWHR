package com.ait.ess.infoApply.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssCoordApplyOtInfoDto {

    private String empId;
    private String localName;
    private String itemNoCode;
    private String deptName;
    private String shiftName;
    private String postGradeNo;
    private String postGradeName;
    private String itemName;
    private String arDateStr;
    private String fromDate;
    private String toTime;
    private String quantity;
    private String unit;
    private String remark;
    private String statusName;
    private String indoorTime;
    private String outdoorTime;

    // Search params
    private String keyword;
    private String startDate;
    private String endDate;
    private String deptNos;
    private String shiftNo;
    private String itemNoSearch;
    private String statusCode;
    private String postFamily;

    // Pagination
    private int draw;
    private int start;
    private int length;
}
