package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Số NV tăng / giảm theo loại (monthPersonIncreaseList / monthPersonDecreaseList) */
@Data
@NoArgsConstructor
public class PaMonthPersonChangeDto {

    /** HIRE (tuyển dụng), RESIGN (thôi việc), OTHER (khác) */
    private String changeType;
    private Integer numb;
}
