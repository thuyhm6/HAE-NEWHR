package com.ait.ar.attendanceSettings.model;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ArSupervisorInfo {
    private Long arSupervisorNo;
    private String personId;
    private String deptno;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
    private String createdIp;
    private String updatedIp;
}
