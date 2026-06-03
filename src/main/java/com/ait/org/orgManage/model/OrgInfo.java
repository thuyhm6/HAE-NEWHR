package com.ait.org.orgManage.model;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OrgInfo {
    private String resumeNo;
    private String deptId;
    private String cpnyId;
    private LocalDate dateCreated;
    private LocalDate dateEnded;
    private Integer deptLevel;
    private String managerEmpId;
    private String deptNo;
    private String parentDeptNo;
    private String workArea;
    private String deptType;
    private String orgNameEng;
    private String orgNameLocal;
    private Integer orgLevel;
    private String costCenter;
    private String isDept;
    private String isPartTime;
    private String productType;
    private String useYn;
    private LocalDateTime createDate;
    private String createdBy;
    private String createdIp;
    private LocalDateTime updateDate;
    private String updatedBy;
    private String updatedIp;
    private Integer orderNo;
    private Integer activity;
    private String changeType;
    private String feeStandard;
    private String deptDistinguishStandard;
    private String orgNameKo;
    private String orgNameVi;
}
