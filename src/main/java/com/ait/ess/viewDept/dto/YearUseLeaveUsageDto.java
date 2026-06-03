package com.ait.ess.viewDept.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class YearUseLeaveUsageDto {
    private String applyNo;
    private String leaveFromDate;
    private String leaveFromTime;
    private String leaveToDate;
    private String leaveToTime;
    private String applyLength;
    private String affirmFlag;
    private String affirmFlagName;
    private String confirmFlag;
    private String confirmFlagName;
}
