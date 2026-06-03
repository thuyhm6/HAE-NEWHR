package com.ait.pa.workManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaPayScheduleDto {

    private String payScheduleNo;
    private String payDate;
    private String salaryDistinNo;
    private String salaryDistinName;
    private String hrStartDate;
    private String hrEndDate;
    private String arStartDate;
    private String arEndDate;
    private String paOpenDate;
    private String paTransDate;
    private String empOpinion;
    private String activity;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;

    // Search params
    private String fromDate;
    private String toDate;
}
