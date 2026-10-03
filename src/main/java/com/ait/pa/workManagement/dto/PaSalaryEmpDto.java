package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 1 dòng lương của nhân viên (PA_SUMMARY_HAE) - danh sách bên trái của màn lương tháng chi tiết
 * (detailmonthCountInfoLeft) và lương năm chi tiết (detailYearCountInfoLeft).
 */
@Data
@NoArgsConstructor
public class PaSalaryEmpDto {

    private String personId;
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;
    private String teamName;
    private String postFamilyName;
    private String postGradeName;
    private String positionName;
    private String payScheduleNo;
    /** DD-MM-YYYY - tham số gọi chi tiết lương năm (giống bản gốc) */
    private String payDate;
    /** DD/MM/YYYY - hiển thị */
    private String payDateFormat;
    private BigDecimal incomeBeforeTax;
    private BigDecimal withholdTotal;
    private BigDecimal realWages;
}
