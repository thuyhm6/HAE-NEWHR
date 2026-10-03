package com.ait.pa.workManagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Kế hoạch trả lương kèm cờ chốt lương (PA_WORK_FLOW.PA_CONFIRM_FLAG). */
@Data
@NoArgsConstructor
public class PaArSummaryScheduleDto {
    private String payScheduleNo;
    private String payDate;
    private String salaryDistinName;
    private Integer paConfirmFlag;
}
