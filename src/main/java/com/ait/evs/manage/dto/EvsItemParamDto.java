package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsItemParamDto {
    private String seq;
    private String resumeSeq;
    private String itemCode;
    private String itemCodeItem;
    private String itemName;
    private String itemRemark;
    private String groupName;
    private String evsGroup;
    private String evsGroupName;
    private String evsOccGroup;
    private String evsOccGroupName;
    private String groupNo;
    private String remark;
    private String itemScore;
    private String activity;
    private String updateDate;
    private String updatedBy;
    // batch delete
    private List<String> seqs;
}
