package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsScoreDto {
    private String seq;
    private String resumeSeq;
    private String scoreType;
    private String no;
    private String name;
    private String deptNo;
    private String deptName;
    private String postGradeNo;
    private String postGradeName;
    private String a;
    private String b;
    private String c;
    private String d;
    private String e;
    private String n;
    private String o;
    private String s;
    private String sum;
    private String activity;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;
    // search params
    private String scoreTypeSearch;
    private String activitySearch;
    private String evsType;
}
