package com.ait.sy.syRole.dto;

import com.ait.sy.syRole.model.SyRoleGroup;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * DTO cho SyRoleGroup để quản lý tên đa ngôn ngữ
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SyRoleGroupDto extends SyRoleGroup {
    private String nameVi;
    private String nameEn;
    private String nameZh;
    private String nameKo;

    /**
     * List of associated Role IDs
     */
    private java.util.List<String> roleNos;
}
