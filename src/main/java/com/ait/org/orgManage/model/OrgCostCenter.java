package com.ait.org.orgManage.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrgCostCenter {
    private String seq;
    private String cpnyId;
    private String codeNo;
    private String codeName;
    private String codeEngName;
    private String remark;
    private String startDate; // VARCHAR2(20)
    private String endDate; // VARCHAR2(20)
    private String country;
    private String address;
    private String activity;
    private Integer orderNo;

    private LocalDateTime createDate;
    private String createdBy;
    private String createdIp;

    private LocalDateTime updateDate;
    private String updatedBy;
    private String updatedIp;

    private String businessScope;
    private String profitCenter;
    private String codeKoreanName;
    private String codeVietnameseName;
}
