package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Số NV tham gia tính lương tháng trước / tháng này theo phân loại lương (monthPersonCountInfoList) */
@Data
@NoArgsConstructor
public class PaMonthPersonCountDto {

    private String salaryDistinNo;
    private String salaryDistinName;
    /** Tháng trước (PASSTIME bản gốc) */
    private Integer preCount;
    /** Tháng này (NOWTIME bản gốc) */
    private Integer nowCount;
}
