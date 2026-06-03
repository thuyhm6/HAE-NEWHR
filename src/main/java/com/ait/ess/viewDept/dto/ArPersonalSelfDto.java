package com.ait.ess.viewDept.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArPersonalSelfDto {
    private String personId;
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;
    private String itemNo;
    private String itemName;
    private String totalQuantity;

    private String startDate;
    private String endDate;
}
