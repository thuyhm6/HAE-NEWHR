package com.ait.sy.syRole.service;

import java.util.List;

import com.ait.sy.syRole.dto.SyRoleDto;

public interface SyRoleService {

    /**
     * Find all roles matching keyword
     */
    List<SyRoleDto> findAll(String keyword);

    /**
     * Find role by ID with details
     */
    SyRoleDto findById(String roleNo);

    /**
     * Save role (create or update)
     */
    void save(SyRoleDto dto) throws Exception;

    /**
     * Delete role
     */
    void delete(String roleNo) throws Exception;

    /**
     * Save role menu relations
     */
    void saveRelations(SyRoleDto dto) throws Exception;

    /**
     * Export roles to Excel/CSV
     */
    byte[] exportExcel();
}
