package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsAffirmRuleDto {
    private String seq;
    private String resumeSeq;
    private String evsType;
    private String evsStep;
    private String evsStepName;
    private String evsGroup;
    private String evsGroupName;
    private String ruleId;
    private String ruleName;
    private String activity;
    private String orderNo;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;
    // batch delete
    private List<String> seqs;
}
