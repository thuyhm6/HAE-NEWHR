package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsParamObjectDto {
    private String seq;
    private String resumeSeq;
    private String evsType;
    private String evsTypeName;
    private String codeNo;
    private String codeName;
    private String formula;
    private String formulaName;
    private String isInclude;
    private String evsGrade;
    private String evsGradeName;
    private String activity;
    private String orderNo;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;
    // batch delete
    private List<String> seqs;
}
