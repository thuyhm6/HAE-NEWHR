package com.ait.ar.attendanceSettings.model;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ArSupervisor {
    private String personId;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
    private Integer modifyYn;
    private String createdIp;
    private String updatedIp;
}
