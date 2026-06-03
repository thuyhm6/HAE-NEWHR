package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArEmpGroup {
    private String personId;
    private String groupNo;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
}
