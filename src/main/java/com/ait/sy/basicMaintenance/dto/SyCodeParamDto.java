package com.ait.sy.basicMaintenance.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SyCodeParamDto extends SyCodeDto {
    private boolean assigned;
    private String paramNo;
    private Integer paramOrderNo;
    private String paramActivity;
    private String cpnyId;
}
