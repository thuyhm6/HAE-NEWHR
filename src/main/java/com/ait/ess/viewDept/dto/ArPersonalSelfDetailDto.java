package com.ait.ess.viewDept.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArPersonalSelfDetailDto {
    private String pkNo;
    private String personId;
    private String empId;
    private String localName;
    private String shiftNo;
    private String shiftName;
    private String arDateStr;
    private String itemNo;
    private String itemName;
    private String fromTimeStr;
    private String toTimeStr;
    private String quantity;

    private String startDate;
    private String endDate;
}
