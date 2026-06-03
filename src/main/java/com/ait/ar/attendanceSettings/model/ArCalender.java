package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArCalender {
    private LocalDate ddate;
    private Integer iyear;
    private Integer imonth;
    private Integer iday;
    private Integer iweek;
    private Integer workdayflag;
    private String ddateStr; // DDATE_STR: YYYY/MM/DD
    private String cpnyId;
    private String shiftNo;
    private String typeid;
    private String overtypeid;
    private String typeidDefault;
    private String operationId;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
    private String updatedIp;
    private String createdIp;
    private Integer statutoryFlag;
    private String remark;
}
