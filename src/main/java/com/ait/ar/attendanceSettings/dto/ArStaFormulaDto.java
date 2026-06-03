package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArStaFormula;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArStaFormulaDto extends ArStaFormula {
    private String itemNameVi;
    private String itemNameEn;
    private String itemNameZh;
    private String itemNameKo;
}
