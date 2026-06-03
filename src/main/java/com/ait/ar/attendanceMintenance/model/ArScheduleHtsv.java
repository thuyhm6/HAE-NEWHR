package com.ait.ar.attendanceMintenance.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArScheduleHtsv {
    private Long pkNo;
    private String personId;
    private String shiftNo;
    private String arDateStr;
    private String lockYn;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private Integer activity;
    private Integer orderno;
    private String addFlag;
    private String updatedIp;
    private String createdIp;
    private Long typeid;
    private String remark;
}
