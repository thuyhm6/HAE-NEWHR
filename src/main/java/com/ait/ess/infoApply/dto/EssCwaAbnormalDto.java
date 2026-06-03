package com.ait.ess.infoApply.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssCwaAbnormalDto {
    private String pkNo;
    private String personId;
    private String empId;
    private String itemNo;
    private String itemName;
    private String fromTime;
    private String toTime;
    private String arDateStr;
    private String dateStr;
    private String indoorTime;
    private String outdoorTime;
    private String shiftStartYyyy;
    private String shiftStartHh;
    private String shiftStartMi;
    private String shiftEndYyyy;
    private String shiftEndHh;
    private String shiftEndMi;
    private String lockYn;

    // search params
    private String startDate;
    private String endDate;
}
