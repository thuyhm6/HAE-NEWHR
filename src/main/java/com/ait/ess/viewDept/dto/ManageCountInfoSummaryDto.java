package com.ait.ess.viewDept.dto;

import lombok.Data;

import java.util.List;

@Data
public class ManageCountInfoSummaryDto {
    private long totalCount;
    private List<ManageCountItemDto> byGender;
    private List<ManageCountItemDto> byEmpType;
    private List<ManageCountItemDto> byDept;
    private List<ManageCountItemDto> byPostFamily;
    private List<ManageCountItemDto> byPostGrade;
    private List<ManageCountItemDto> byAge;
}
