package com.ait.ess.viewDept.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class YearUseVacationDto {
    private String strtDate;
    private String endDate;
    private String totVacCnt;
    private String addVac;
    private String lastYearVac;
    private String total;
    private String useVac;
    private String affirmUseVac;
    private String remainVac;
}
