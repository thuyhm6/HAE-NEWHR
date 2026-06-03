package com.ait.pa.salary.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaParamDataTempDto {
    private String paramNo;
    private String empId;
    private String returnValue;
    private String startMonth;
    private String endMonth;
    private String remark;
    private String localName;
    private String uploadErrorMsg;
    private Long   lineId;
    private String resultFlag;
    private String uploadBy;
    private String uploadDate;
    private String paramItemName;

    // Filter
    private String errorOnly;
}
