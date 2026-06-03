package com.ait.ess.infoApplyLeave.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EssCardApplyListDto {
    private String applyNo;
    private String personId;
    private String arDateStr;
    private String itemNo;
    private String itemName;
    private String indoorTime;
    private String outdoorTime;
    private String fromTime;
    private String toTime;
    private String shiftName;
    private String workTime;
    private String applyReason;
    private String affirmFlag;
    private String affirmFlagName;
    private String hrComment;
    private String workHour;

    // search params
    private String affirmFlagSearch;
    private String startDate;
    private String endDate;
}
