package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArShift020 {
    private Long pkNo;
    private Integer beginDayOffset;
    private LocalDateTime fromTime;
    private Integer endDayOffset;
    private LocalDateTime toTime;
    private String shiftNo;
    private String itemNo;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
}
