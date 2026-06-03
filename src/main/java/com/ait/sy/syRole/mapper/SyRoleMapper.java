package com.ait.sy.syRole.mapper;

import com.ait.sy.syRole.dto.SyRoleDto;
import com.ait.sy.syRole.model.SyRole;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * SyRoleMapper - Interface cho các thao tác với bảng sy_role
 */
@Mapper
public interface SyRoleMapper {

    /**
     * Tìm role theo roleNo
     * 
     * @param roleNo Mã vai trò
     * @return SyRole object hoặc null
     */
    SyRole findByRoleNo(@Param("roleNo") String roleNo);

    /**
     * Tìm roles theo cpnyId
     * 
     * @param cpnyId ID công ty
     * @return List<SyRole>
     */
    List<SyRole> findByCpnyId(@Param("cpnyId") String cpnyId);

    /**
     * Lấy danh sách roles hoạt động
     * 
     * @return List<SyRole>
     */
    List<SyRole> findAllActive();

    /**
     * Tìm roles theo roleGroupNo (qua bảng trung gian)
     * 
     * @param roleGroupNo Mã nhóm vai trò
     * @return List<SyRole>
     */
    List<SyRole> findByRoleGroupNo(@Param("roleGroupNo") String roleGroupNo);

    /**
     * Kiểm tra role có tồn tại và hoạt động không
     * 
     * @param roleNo Mã vai trò
     * @return true nếu tồn tại và hoạt động
     */
    boolean existsAndActive(@Param("roleNo") String roleNo);

    /**
     * Get next sequence value from SY_GLOBAL_SEQ
     * 
     * @return Next sequence value as String
     */
    String getNextVal();

    /**
     * Insert a new role
     * 
     * @param syRole SyRole object
     * @return Number of rows affected
     */
    int insert(SyRole syRole);

    /**
     * Update an existing role
     * 
     * @param syRole SyRole object
     * @return Number of rows affected
     */
    int update(SyRole syRole);

    /**
     * Delete a role (logical or physical)
     * Here we usually do logical delete (update ACTIVITY=0) or physical delete
     * based on existing pattern.
     * Given user asks for full CRUD, physical delete or logical delete is
     * acceptable, but let's implement both or clarify.
     * Usually enterprise apps prefer logical delete. But prompt says "xóa".
     * Let's implement physical delete for simplicity unless otherwise indicated by
     * codebase (which uses ACTIVITY column extensively).
     * Actually, the prompt says "có đầy đủ chức năng thêm mới, sửa, xóa".
     * I'll implement deleteByRoleNo.
     */
    int deleteByRoleNo(@Param("roleNo") String roleNo);

    /**
     * Find all roles with search criteria
     * 
     * @param keyword Search keyword (match ID or Name)
     * @return List of roles
     */
    List<SyRoleDto> findAllWithNames(@Param("keyword") String keyword);
}
