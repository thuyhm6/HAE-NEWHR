package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArItem;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArItemDto extends ArItem {
    private String nameVi;
    private String nameEn;
    private String nameZh;
    private String nameKo;
}
