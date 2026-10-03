package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Chi tiết tăng ca theo ngày của 1 nhân viên (viewResultConfirmList2Bottom bản gốc) */
@Data
@NoArgsConstructor
public class PaArDetailDto {

    private String empId;
    private String localName;
    /** DD/MM/YYYY */
    private String arDateStr;
    /** DD/MM/YYYY HH24:MI */
    private String fromTime;
    private String toTime;
    private String shiftName;
    private String itemName;
    private BigDecimal quantity;
}
