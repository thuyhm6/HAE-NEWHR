package com.ait.hrm.approve.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class HrmApproveApplyDto {

    private String applyNo;
    private String applyTableType;
    private String personId;
    private String createDate;
    private Integer activity;
    private Integer applyType;
    private String managerInfo;
    private String callback;
    private String earror;
    private String empName;
    private String empCode;
    private String deptName;

    // Search params
    private String fromDate;
    private String toDate;
    private Integer activitySearch;
    private String keyword;

    // Pagination
    private int draw;
    private int start;
    private int length;
}
