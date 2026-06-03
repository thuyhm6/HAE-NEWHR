package com.ait.org.orgManage.model;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OrgResumeInfo {
    private String seq;
    private String no;
    private LocalDate changeDate;
    private String resumeName;
    private String isCurrentOrg;
    private String changeReason;
    private LocalDateTime createDate;
    private String createdBy;
    private LocalDateTime updateDate;
    private String updatedBy;
    private String activity;
    private String cpnyId;
    private String updatedIp;
    private String fromNo;
    private String remark;
    private String createdIp;
    private String experienceType;

    // Additional fields for display if needed (e.g. formatted dates)
}
