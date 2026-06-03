package com.ait.pa.workManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaPayObjDto {

    // PK (composite)
    private String payScheduleNo;
    private String empId;

    // From PA_PAY_OBJECT
    private String personId;
    private String deptNo;
    private Integer includeType;
    private Integer createType;
    private Integer activity;
    private String wageType;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;

    // From HR_EMPLOYEE / HR_DEPARTMENT (display only)
    private String empName;
    private String deptName;
    private String empOffice;

    // Search params
    private String empSearch;
    private String empOfficeCond;

    // Server-side pagination (DataTables)
    private int draw;
    private int start;
    private int length;

    // Batch delete / update
    private List<PaPayObjDto> items;
}
