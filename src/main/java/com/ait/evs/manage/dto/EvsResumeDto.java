package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsResumeDto {
    private String seq;
    private String evsType;
    private String resumeName;
    private String remark;
    private String evsCycle;
    private String evsCycleName;
    private String evsYear;
    private String evsMonth;
    private String evsMonthName;
    private String standardDate;
    private String evsStartDate;
    private String evsEndDate;
    private String activity;
    private String activityName;
    private String evsLevel;
    private String evsLevelName;
    private String copyObject;
    private String copyObjectName;
    private String targetLevel;
    private String orderNo;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;
    // search params
    private String yearSearch;
    private String cycleSearch;
}
