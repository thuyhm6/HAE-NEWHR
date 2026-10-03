package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsResultEmpDto {

    private String evsYear;
    private String firstHalfYear;
    private String secondHalfYear;
    private String evsPerformance;
    private String evsAbility;
}
