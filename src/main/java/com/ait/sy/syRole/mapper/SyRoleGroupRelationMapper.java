package com.ait.sy.syRole.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.sy.syRole.model.SyRoleGroupRelation;

import java.util.List;

/**
 * SyRoleGroupRelationMapper - Interface cho các thao tác với bảng
 * sy_role_group_relation
 */
@Mapper
public interface SyRoleGroupRelationMapper {

    /**
     * Tìm relations theo roleGroupNo
     * 
     * @param roleGroupNo Mã nhóm vai trò
     * @return List<SyRoleGroupRelation>
     */
    List<SyRoleGroupRelation> findByRoleGroupNo(@Param("roleGroupNo") String roleGroupNo);

    /**
     * Tìm relations theo roleNo
     * 
     * @param roleNo Mã vai trò
     * @return List<SyRoleGroupRelation>
     */
    List<SyRoleGroupRelation> findByRoleNo(@Param("roleNo") String roleNo);

    /**
     * Kiểm tra role group có role không
     * 
     * @param roleGroupNo Mã nhóm vai trò
     * @param roleNo      Mã vai trò
     * @return true nếu có
     */
    boolean hasRole(@Param("roleGroupNo") String roleGroupNo, @Param("roleNo") String roleNo);

    /**
     * Lấy danh sách relations hoạt động theo roleGroupNo
     * 
     * @param roleGroupNo Mã nhóm vai trò
     * @return List<SyRoleGroupRelation>
     */
    List<SyRoleGroupRelation> findActiveByRoleGroupNo(@Param("roleGroupNo") String roleGroupNo);

    /**
     * Delete all relations for a role group
     * 
     * @param roleGroupNo
     */
    void deleteByRoleGroupNo(@Param("roleGroupNo") String roleGroupNo);

    /**
     * Insert a new relation
     * 
     * @param relation
     */
    void insert(SyRoleGroupRelation relation);
}
