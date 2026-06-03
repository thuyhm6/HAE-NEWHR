package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArCalenderGroupHistory {
    private LocalDate ddate;
    private Integer iyear;
    private Integer imonth;
    private Integer iday;
    private Integer iweek;
    private Integer workdayflag;
    private Integer typeid;
    private Integer overtypeid;
    private Integer typeidDefault;
    private String groupId;
    private Integer shiftNo;
    private String arDateStr; // AR_DATE_STR: YYYY/MM/DD
    private String cpnyId;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
    private String operationId;
    private String updatedIp;
    private String createdIp;
}
