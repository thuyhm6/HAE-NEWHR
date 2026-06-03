package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArItemParam;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArItemParamDto extends ArItemParam {
    private String companyName;
    private String itemNameVi;
    private String itemNameEn;
    private String itemNameZh;
    private String itemNameKo;

    private String itemName;
}
