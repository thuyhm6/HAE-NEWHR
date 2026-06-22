package com.ait.ess.empinfo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class EssApplyInfoDto {

    private String applyNo;
    private String applyTableType;  // PERSONAL, ADDRESS, FAMILY, EMERGENCY, WORK_EXP, EDUCATION, QUALIFICATION
    private String personId;
    private String createDate;
    private Integer activity;
    private Integer applyType;      // 1=Thêm mới, 2=Sửa
    private String managerInfo;
    private String callback;
    private String earror;

    // Search params
    private String fromDate;
    private String toDate;
    private Integer activitySearch;
    private String keyword;

    // Pagination
    private int draw;
    private int start;
    private int length;
    private int totalCount;
}
