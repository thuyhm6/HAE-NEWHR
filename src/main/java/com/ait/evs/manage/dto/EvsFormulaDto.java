package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsFormulaDto {
    private String seq;
    private String codeNo;
    private String codeName;
    private String formula;
    private String remark;
    private String activity;
    private String orderNo;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;
    // search params
    private String codeNoSearch;
    private String codeNameSearch;
    private String activitySearch;
}
