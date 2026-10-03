package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** 1 dòng so sánh hạng mục chi trả tháng trước / tháng này (getPaMonthList - viewPaMonthChain) */
@Data
@NoArgsConstructor
public class PaMonthChainDto {

    private String itemId;
    private String itemName;
    private String pageType;
    private String itemType;
    private BigDecimal personNum;
    private BigDecimal personNumPro;
    private BigDecimal personNumDif;
    private BigDecimal countNum;
    private BigDecimal countNumPro;
    private BigDecimal countNumDif;
    private BigDecimal personNumAvg;
    private BigDecimal personNumAvgPro;
    private BigDecimal personNumAvgDif;
    private BigDecimal countUp;
    private BigDecimal countLow;
    private BigDecimal personUp;
    private BigDecimal personLow;
}
