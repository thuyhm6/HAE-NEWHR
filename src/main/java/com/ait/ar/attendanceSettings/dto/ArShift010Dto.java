package com.ait.ar.attendanceSettings.dto;

import com.ait.ar.attendanceSettings.model.ArShift010;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArShift010Dto extends ArShift010 {
    private String nameVi;
    private String nameEn;
    private String nameZh;
    private String nameKo;
    private String adminID;
    private String companyName;
}
