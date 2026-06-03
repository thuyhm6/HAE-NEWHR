package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaEmpAccountDto {

    private Long paEmpAccountNo;
    private String personId;
    private String empId;
    private String localName;
    private String deptName;
    private String postGradeName;
    private String dateStarted;
    private Integer accountType;
    private String accountTypeName;
    private String accountAddress;
    private String accountNo;
    private String accountName;
    private String securityNo;
    private String fundNo;
    private String securityPayDate;
    private String fundPayDate;
    private String taxNo;
    private Integer activity;
    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;

    // Search conditions
    private String empSearch;
    private String deptNos;
    private List<String> deptNoList;
    private String empOfficeSearch;
    private String bankSearch;
    private String fromDateStarted;
    private String toDateStarted;

    // Server-side pagination (DataTables)
    private int draw;
    private int start;
    private int length;
}
