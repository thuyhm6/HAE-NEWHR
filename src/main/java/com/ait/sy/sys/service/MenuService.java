package com.ait.sy.sys.service;

import com.ait.sy.sys.dto.MenuDTO;

import java.util.List;

/**
 * MenuService - Service cho menu và quyền
 */
public interface MenuService {

    /**
     * Lấy danh sách menu có phân cấp theo quyền của user
     * 
     * @param userNo Mã người dùng
     * @return Danh sách menu có phân cấp
     */
    List<MenuDTO> getMenusByUserPermission(String userNo);

    /**
     * Lấy danh sách menu có phân cấp theo quyền của user và SYS_TYPE
     *
     * @param userNo  Mã người dùng
     * @param sysType SYS_TYPE của role
     * @return Danh sách menu có phân cấp
     */
    List<MenuDTO> getMenusByUserPermissionBySysType(String userNo, String sysType);

    /**
     * Lấy danh sách menu có phân cấp theo quyền của user với ngôn ngữ cụ thể
     * 
     * @param userNo   Mã người dùng
     * @param language Mã ngôn ngữ (vi, en, ko, zh)
     * @return Danh sách menu có phân cấp
     */
    List<MenuDTO> getMenusByUserPermissionWithLanguage(String userNo, String language);

    /**
     * Lấy danh sách menu gốc theo quyền của user
     * 
     * @param userNo Mã người dùng
     * @return Danh sách menu gốc
     */
    List<MenuDTO> getRootMenusByUserPermission(String userNo);

    /**
     * Kiểm tra user có menu theo SYS_TYPE hay không
     *
     * @param userNo  Mã người dùng
     * @param sysType SYS_TYPE của role
     * @return true nếu có ít nhất một menu
     */
    boolean hasMenusByUserPermissionBySysType(String userNo, String sysType);
}
