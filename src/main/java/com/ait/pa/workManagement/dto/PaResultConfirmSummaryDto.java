package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Biến động tổng tháng trước / tháng này (viewResultConfirmSonList0 bản gốc) */
@Data
@NoArgsConstructor
public class PaResultConfirmSummaryDto {

    private String payDatePro;
    private String payDateCur;
    private BigDecimal personNumPro;
    private BigDecimal salaryTotalPro;
    private BigDecimal withholdTotalPro;
    private BigDecimal netPayPro;
    private BigDecimal personNumCur;
    private BigDecimal salaryTotalCur;
    private BigDecimal withholdTotalCur;
    private BigDecimal netPayCur;
    private BigDecimal personNumDif;
    private BigDecimal salaryTotalDif;
    private BigDecimal withholdTotalDif;
    private BigDecimal netPayDif;
}
