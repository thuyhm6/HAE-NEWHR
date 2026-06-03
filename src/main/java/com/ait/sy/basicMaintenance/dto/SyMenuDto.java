package com.ait.sy.basicMaintenance.dto;

import com.ait.sy.basicMaintenance.model.SyMenu;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * DTO cho SyMenu, bổ sung các trường hiển thị ngôn ngữ
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SyMenuDto extends SyMenu {
    private String nameVi;
    private String nameEn;
    private String nameZh;
    private String nameKo;
    private String parentMenuName;
}
