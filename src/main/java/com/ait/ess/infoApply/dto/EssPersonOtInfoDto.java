package com.ait.ess.infoApply.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssPersonOtInfoDto {
    private String pkNo;
    private String personId;
    private String empId;
    private String localName;
    private String deptName;
    private String itemNo;
    private String itemName;
    private String shiftNo;
    private String shiftName;
    private String arDateStr;
    private String workTime;      // HH:MI ~ HH:MI
    private String indoorTime;    // Vào  - HH:MI
    private String outdoorTime;   // Ra   - HH:MI
    private String otStartTime;   // Thời gian bắt đầu tăng ca - full datetime
    private String otEndTime;     // Thời gian kết thúc         - full datetime
    private String workHour;      // QUANTITY

    // search params
    private String startDate;
    private String endDate;
    private String itemNoSearch;
    private String minQuantity;
}
