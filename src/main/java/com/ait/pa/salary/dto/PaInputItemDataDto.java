package com.ait.pa.salary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaInputItemDataDto {

    // PA_PARAM_ITEM_PARAM (left panel)
    private String paramNo;
    private String paramItemNo;
    private String defaultVal;
    private String paramItemId;
    private String paramName;

    // PA_PARAM_DATA (right panel)
    private Long   paramDataNo;
    private String personId;
    private String returnValue;
    private String distinctField;
    private String distinctField2nd;
    private String distinctFieldName;
    private String distinctField2ndName;
    private String empId;
    private String localName;
    private String deptName;
    private String postGradeName;
    private String empOffice;
    private String dateStarted;
    private String dateLeft;
    private String startMonth;
    private String endMonth;
    private String cpnyId;
    private String cpnyName;
    private String isApply;
    private String remark;

    // Search conditions
    private String payMonth;
    private String empOfficeSearch;
    private String deptNos;
    private String empSearch;
    private String itemType;

    // Server-side pagination (DataTables)
    private int draw;
    private int start;
    private int length;
}
