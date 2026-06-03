package com.ait.sy.basicMaintenance.dto;

import com.ait.sy.basicMaintenance.model.HrCompany;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class HrCompanyDto extends HrCompany {
    private String nameVi;
    private String nameEn;
    private String nameZh;
    private String nameKo;
}
