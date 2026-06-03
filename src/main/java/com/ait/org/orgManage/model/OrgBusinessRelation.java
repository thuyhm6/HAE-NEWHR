package com.ait.org.orgManage.model;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OrgBusinessRelation {
    private String seq;
    private String resumeNo;
    private String cpnyId;
    private String deptNo;
    private String codeNo;
    private String isDefault;
    private String activity;
    private Integer orderNo;

    private LocalDateTime createDate;
    private String createdBy;
    private String createdIp;

    private LocalDateTime updateDate;
    private String updatedBy;
    private String updatedIp;

    // Virtual fields for display (Mapped in XML ResultMap)
    private String businessName;
    private String deptName;
}
