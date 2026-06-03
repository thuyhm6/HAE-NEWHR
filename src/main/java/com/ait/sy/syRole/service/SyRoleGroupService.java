package com.ait.sy.syRole.service;

import java.util.List;

import com.ait.sy.syRole.dto.SyRoleGroupDto;

public interface SyRoleGroupService {
    List<SyRoleGroupDto> findAll(String keyword);

    void save(SyRoleGroupDto dto);

    void saveRelations(String roleGroupNo, java.util.List<String> roleNos);

    SyRoleGroupDto findByRoleGroupNo(String roleGroupNo);

    void delete(String roleGroupId);

    byte[] exportExcel();
}
