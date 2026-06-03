package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArStaItemParam;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArStaItemParamDto extends ArStaItemParam {
    private String itemNameVi;
    private String itemNameEn;
    private String itemNameZh;
    private String itemNameKo;
    private String companyName;
}
