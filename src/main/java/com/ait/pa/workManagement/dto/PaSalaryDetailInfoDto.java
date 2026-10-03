package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** 1 hạng mục chi tiết lương kèm công thức (PA_SALARY_DETAIL_PAGE_DATA - getPaDetailInfoList bản gốc) */
@Data
@NoArgsConstructor
public class PaSalaryDetailInfoDto {

    /** 1 chi trả, 2 khấu trừ, 3 bảo hiểm công ty */
    private String itemType;
    private String itemNo;
    private String itemName;
    private BigDecimal itemValue;
    private String itemFormular;
}
