package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 1 hạng mục lương chi tiết (PA_MY_SALARY_PAGE_DATA) - phần bên phải của màn lương tháng / năm
 * chi tiết (detailYearCountInfoRight bản gốc). itemType: 1 = chi trả, 2 = khấu trừ, 3 = khác.
 */
@Data
@NoArgsConstructor
public class PaSalaryDetailItemDto {

    private String personId;
    private String itemType;
    private String itemNo;
    private String itemName;
    private BigDecimal itemValue;
    private BigDecimal itemYearValue;
}
