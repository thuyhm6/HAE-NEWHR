package com.ait.sy.basicMaintenance.dto;

import com.ait.sy.basicMaintenance.model.SyCode;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SyCodeDto extends SyCode {
    private String codeName; // tên theo ngôn ngữ hiện tại, dùng để hiển thị
    private String nameVi;
    private String nameEn;
    private String nameZh;
    private String nameKo;
}
