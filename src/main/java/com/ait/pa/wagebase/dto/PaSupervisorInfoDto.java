package com.ait.pa.wagebase.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaSupervisorInfoDto {
    private Long paSupervisorNo;
    private String personId;
    private String deptNo;
    private Integer activity;
    private Integer orderNo;
}
