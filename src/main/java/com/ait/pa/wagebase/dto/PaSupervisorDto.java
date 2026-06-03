package com.ait.pa.wagebase.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaSupervisorDto {

    private String personId;
    private String empId;
    private String localName;
    private String deptName;
    private String empOffice;
    private String createDate;
    private String createdBy;
    private Integer activity;
    private Integer orderNo;

    // Search conditions
    private String empSearch;
    private String deptNos;         // comma-separated từ client
    private List<String> deptNoList; // parsed list cho MyBatis foreach
    private String empOfficeSearch;

    // Server-side pagination (DataTables)
    private int draw;
    private int start;
    private int length;
}
