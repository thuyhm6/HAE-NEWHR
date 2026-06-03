package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsScheduleDto {
    private String seq;
    private String resumeSeq;
    private String scheduleType;
    private String evsType;
    private String no;
    private String name;
    private String deptNo;
    private String deptName;
    private String postGradeNo;
    private String postGradeName;
    private String evsObject;
    private String evsStep;
    private String evsStepName;
    private String activity;
    private String deptType;
    private String orderNo;
    private String personId;
    private String startDate;
    private String endDate;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;
    // batch delete
    private List<String> seqs;
}
