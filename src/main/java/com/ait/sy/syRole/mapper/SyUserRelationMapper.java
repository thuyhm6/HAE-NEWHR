package com.ait.sy.syRole.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.sy.syRole.model.SyUserRelation;

import java.util.List;

/**
 * SyUserRelationMapper - Interface cho các thao tác với bảng sy_user_relation
 */
@Mapper
public interface SyUserRelationMapper {

    /**
     * Tìm role groups theo userNo
     * 
     * @param userNo Mã người dùng
     * @return List<SyUserRelation>
     */
    List<SyUserRelation> findByUserNo(@Param("userNo") String userNo);

    /**
     * Tìm users theo roleGroupNo
     * 
     * @param roleGroupNo Mã nhóm vai trò
     * @return List<SyUserRelation>
     */
    List<SyUserRelation> findByRoleGroupNo(@Param("roleGroupNo") String roleGroupNo);

    /**
     * Kiểm tra user có role group không
     * 
     * @param userNo      Mã người dùng
     * @param roleGroupNo Mã nhóm vai trò
     * @return true nếu có
     */
    boolean hasRoleGroup(@Param("userNo") String userNo, @Param("roleGroupNo") String roleGroupNo);

    /**
     * Lấy danh sách role groups hoạt động của user
     * 
     * @param userNo Mã người dùng
     * @return List<SyUserRelation>
     */
    List<SyUserRelation> findActiveByUserNo(@Param("userNo") String userNo);

    /**
     * @param userNo
     */
    void deleteByUserNo(@Param("userNo") String userNo);

    /**
     * @param roleGroupNo
     */
    void deleteByRoleGroupNo(@Param("roleGroupNo") String roleGroupNo);

    /**
     * @param relation
     */
    void insert(SyUserRelation relation);
}
