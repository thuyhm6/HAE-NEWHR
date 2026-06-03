package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArStatisticDate;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArStatisticDateDto extends ArStatisticDate {
    private String nameVi;
    private String nameEn;
    private String nameZh;
    private String nameKo;
}
