package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsItemDto {
    private String seq;
    private String resumeSeq;
    private String groupNo;
    private String groupName;
    private String itemCode;
    private String itemName;
    private String itemNameKo;
    private String remark;
    private String remarkKo;
    private String activity;
    private String orderNo;
    private String updateDate;
    private String updatedBy;
    // batch delete
    private List<String> seqs;
}
