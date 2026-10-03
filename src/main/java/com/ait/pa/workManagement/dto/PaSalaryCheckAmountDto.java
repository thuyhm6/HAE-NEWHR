package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** 1 dòng thuế / bảo hiểm cá nhân của tab Thuế + Chi tiết bảo hiểm (viewResultConfirmSonList5 / 6) */
@Data
@NoArgsConstructor
public class PaSalaryCheckAmountDto {

    private String empId;
    private String localName;
    private String deptName;
    private String postFamilyName;
    private String postGradeName;
    private String positionName;

    private BigDecimal incomeBeforeTax;
    private BigDecimal attDeductTotal;
    private BigDecimal personalInsTotal;
    private BigDecimal taxDeductStd;
    private BigDecimal taxFamilyDeductStd;
    private BigDecimal taxFamilyDeductCount;
    private BigDecimal taxableIncome;
    private BigDecimal ptTaxRate;
    private BigDecimal quickDeductionTax;
    private BigDecimal personalTax;
    private BigDecimal realWages;

    private BigDecimal socialInsPersonal;
    private BigDecimal medicalInsPersonal;
    private BigDecimal unemploymentInsPersonal;
}
