package com.ait.sy.syRole.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.sy.syRole.model.SyRoleRelation;

import java.util.List;

/**
 * SyRoleRelationMapper - Interface cho các thao tác với bảng sy_role_relation
 */
@Mapper
public interface SyRoleRelationMapper {

    /**
     * Tìm relations theo roleNo
     * 
     * @param roleNo Mã vai trò
     * @return List<SyRoleRelation>
     */
    List<SyRoleRelation> findByRoleNo(@Param("roleNo") String roleNo);

    /**
     * Tìm relations theo menuNo
     * 
     * @param menuNo Mã menu
     * @return List<SyRoleRelation>
     */
    List<SyRoleRelation> findByMenuNo(@Param("menuNo") String menuNo);

    /**
     * Tìm relation theo roleNo và menuNo
     * 
     * @param roleNo Mã vai trò
     * @param menuNo Mã menu
     * @return SyRoleRelation object hoặc null
     */
    SyRoleRelation findByRoleNoAndMenuNo(@Param("roleNo") String roleNo, @Param("menuNo") String menuNo);

    /**
     * Kiểm tra role có quyền trên menu không
     * 
     * @param roleNo Mã vai trò
     * @param menuNo Mã menu
     * @return true nếu có quyền
     */
    boolean hasPermission(@Param("roleNo") String roleNo, @Param("menuNo") String menuNo);

    /**
     * Kiểm tra role có quyền SELECT trên menu không
     * 
     * @param roleNo Mã vai trò
     * @param menuNo Mã menu
     * @return true nếu có quyền SELECT
     */
    boolean hasSelectPermission(@Param("roleNo") String roleNo, @Param("menuNo") String menuNo);

    /**
     * Kiểm tra role có quyền INSERT trên menu không
     * 
     * @param roleNo Mã vai trò
     * @param menuNo Mã menu
     * @return true nếu có quyền INSERT
     */
    boolean hasInsertPermission(@Param("roleNo") String roleNo, @Param("menuNo") String menuNo);

    /**
     * Kiểm tra role có quyền UPDATE trên menu không
     * 
     * @param roleNo Mã vai trò
     * @param menuNo Mã menu
     * @return true nếu có quyền UPDATE
     */
    boolean hasUpdatePermission(@Param("roleNo") String roleNo, @Param("menuNo") String menuNo);

    /**
     * Kiểm tra role có quyền DELETE trên menu không
     * 
     * @param roleNo Mã vai trò
     * @param menuNo Mã menu
     * @return true nếu có quyền DELETE
     */
    boolean hasDeletePermission(@Param("roleNo") String roleNo, @Param("menuNo") String menuNo);

    /**
     * Lấy danh sách relations hoạt động theo roleNo
     * 
     * @param roleNo Mã vai trò
     * @return List<SyRoleRelation>
     */
    List<SyRoleRelation> findActiveByRoleNo(@Param("roleNo") String roleNo);

    /**
     * Insert a new relation
     * 
     * @param relation SyRoleRelation object
     * @return Number of rows affected
     */
    int insert(SyRoleRelation relation);

    /**
     * Delete relations by roleNo
     * 
     * @param roleNo Role Number
     * @return Number of rows affected
     */
    int deleteByRoleNo(@Param("roleNo") String roleNo);
}
