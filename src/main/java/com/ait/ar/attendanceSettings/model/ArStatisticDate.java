package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArStatisticDate {
    private String statNo;
    private Integer beginMonthOffset;
    private Integer endMonthOffset;
    private String validDateFrom;
    private String validDateTo;
    private Integer startDay;
    private Integer endDay;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
}
