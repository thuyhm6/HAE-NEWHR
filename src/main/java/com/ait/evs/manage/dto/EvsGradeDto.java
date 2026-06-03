package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsGradeDto {
    private String seq;
    private String resumeSeq;
    private String evsType;
    private String evsTypeName;
    private String evsGrade;
    private String evsGradeOriginal;
    private String evsGradeName;
    private String isInclude;
    private String startScore;
    private String endScore;
    private String score;
    private String remark;
    private String activity;
    private String orderNo;
    private String distributionRate;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;
    // batch delete
    private List<String> seqs;
}
