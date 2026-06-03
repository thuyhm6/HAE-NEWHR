package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsParamDto {
    private String seq;
    private String resumeSeq;
    private String paramType;
    private String evsType;
    private String codeNo;
    private String codeName;
    private String formula;
    private String formulaName;
    private String remark;
    private String activity;
    private String orderNo;
    private String startStep;
    private String startStepName;
    private String listType;
    private String evsScore;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;
    // batch delete
    private List<String> seqs;
}
