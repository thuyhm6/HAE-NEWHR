package com.ait.sy.sys.mapper;

import com.ait.sy.sys.dto.MenuDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MenuMapper - Mapper cho menu và quyền
 */
@Mapper
public interface MenuMapper {

    /**
     * Lấy danh sách menu theo quyền của user
     * 
     * @param userNo Mã người dùng
     * @return Danh sách menu có quyền truy cập
     */
    List<MenuDTO> getMenusByUserPermission(@Param("userNo") String userNo);

    /**
     * Lấy danh sách menu theo quyền của user và SYS_TYPE của role
     *
     * @param userNo  Mã người dùng
     * @param sysType SYS_TYPE của role
     * @return Danh sách menu có quyền truy cập
     */
    List<MenuDTO> getMenusByUserPermissionBySysType(@Param("userNo") String userNo,
            @Param("sysType") String sysType);

    /**
     * Lấy danh sách menu theo quyền của user với ngôn ngữ cụ thể
     * 
     * @param userNo   Mã người dùng
     * @param language Mã ngôn ngữ (vi, en, ko, zh)
     * @return Danh sách menu có quyền truy cập
     */
    List<MenuDTO> getMenusByUserPermissionWithLanguage(@Param("userNo") String userNo,
            @Param("language") String language);

    /**
     * Lấy danh sách menu gốc (không có parent) theo quyền của user
     * 
     * @param userNo Mã người dùng
     * @return Danh sách menu gốc
     */
    List<MenuDTO> getRootMenusByUserPermission(@Param("userNo") String userNo);

    /**
     * Đếm số menu theo quyền của user và SYS_TYPE của role
     *
     * @param userNo  Mã người dùng
     * @param sysType SYS_TYPE của role
     * @return Số lượng menu
     */
    int countMenusByUserPermissionBySysType(@Param("userNo") String userNo,
            @Param("sysType") String sysType);

    /**
     * Lấy danh sách menu con theo parent và quyền của user
     * 
     * @param userNo       Mã người dùng
     * @param parentMenuNo Mã menu cha
     * @return Danh sách menu con
     */
    List<MenuDTO> getChildMenusByUserPermission(@Param("userNo") String userNo,
            @Param("parentMenuNo") String parentMenuNo);
}
