package com.ait.sy.syRole.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

import com.ait.sy.syRole.model.SyRole;
import com.ait.sy.syRole.model.SyRoleRelation;

@Data
@EqualsAndHashCode(callSuper = true)
public class SyRoleDto extends SyRole {
    
    // Multilingual names
    private String nameVi;
    private String nameEn;
    private String nameZh;
    private String nameKo;

    // List of relations (menus and permissions)
    private List<SyRoleRelation> roleRelations;

    // For tree selection - maybe just a list of menu IDs? 
    // Or complex objects if we set specific permissions.
    // For now, let's assume we receive list of relations or list of DTOs.
}
