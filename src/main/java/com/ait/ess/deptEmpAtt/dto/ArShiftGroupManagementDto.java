package com.ait.ess.deptEmpAtt.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArShiftGroupManagementDto {

    private Long   pkNo;
    private String personId;

    // Lấy từ JOIN HR_EMPLOYEE
    private String empId;
    private String localName;

    private String beforShiftNo;  // Ca trước khi thay đổi
    private String beforShiftName;
    private String shiftNo;       // Ca sau khi thay đổi
    private String shiftName;
    private String startDate;     // YYYY-MM-DD
    private String remark;

    private String createDate;
    private String createdBy;
    private String updateDate;
    private String updatedBy;
    private Integer activity;

    // Filter params (ESS query)
    private String fromDate;
    private String toDate;
}
