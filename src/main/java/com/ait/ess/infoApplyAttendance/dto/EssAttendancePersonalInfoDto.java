package com.ait.ess.infoApplyAttendance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssAttendancePersonalInfoDto {
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
    private String indoorTime;
    private String outdoorTime;
    private String workHour;

    // search params
    private String startDate;
    private String endDate;
    private String itemNoSearch;
}
