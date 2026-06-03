package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArStaItem;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArStaItemDto extends ArStaItem {
    private String nameVi;
    private String nameEn;
    private String nameZh;
    private String nameKo;
}
