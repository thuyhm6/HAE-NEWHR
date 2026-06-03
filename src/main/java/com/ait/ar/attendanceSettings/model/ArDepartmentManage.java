package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArDepartmentManage {
    private Long manageNo;
    private String cpnyId;
    private String deptNo;
    private String deptName;
    private String parentDeptNo;
    private String lockDate; // Format YYYYMMDD

    private String lockAttenFlag;
    private String lockAttenNightFlag;

    private String lockOtFlag;
    private String lockOtLimitFlag;
    private String lockOtNightFlag;

    private String lockAttenExFlag;
    private String lockAttenExNightFlag;

    private String lockAttenAnnualFlag;
    private String lockAttenAnnualNightFlag;

    private LocalDateTime createDate;
    private String createdBy;
    private String createdIp;
    private LocalDateTime updateDate;
    private String updatedBy;
    private String updatedIp;

    private Integer activity;
    private Integer orderno;
    private String remark;
    private String affirmFlag;
}
