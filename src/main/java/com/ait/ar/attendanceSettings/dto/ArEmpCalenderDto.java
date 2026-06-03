package com.ait.ar.attendanceSettings.dto;

import lombok.Data;

@Data
public class ArEmpCalenderDto {
    // AR_CALENDER base fields
    private String arDateStr;
    private String ddateStr;
    private String ddateFormatted;  // TO_CHAR(DDATE,'YYYY-MM-DD')
    private Integer iyear;
    private Integer imonth;
    private Integer iday;
    private Integer iweek;
    private Integer workdayflag;
    private Integer statutoryFlag;
    private String cpnyId;
    private String overtypeid;
    private String typeidDefault;
    private String remark;

    // Computed via DB functions for specific personId
    private String shiftNo;    // GET_AR_SHIFTNO(personId, ddateStr, cpnyId)
    private String typeid;     // GET_AR_DATETYPE_DETAIL(personId, ddateStr, cpnyId)

    // Human-readable names
    private String shiftName;
    private String typeidName;
    private String overtypeidName;
    private String typeidDefaultName;

    // Person info (for display)
    private String personId;
    private String empId;
    private String localName;
}
