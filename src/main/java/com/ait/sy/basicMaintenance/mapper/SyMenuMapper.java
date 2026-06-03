package com.ait.sy.basicMaintenance.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.sy.basicMaintenance.model.SyMenu;

import java.util.List;

/**
 * SyMenuMapper - Interface cho các thao tác với bảng sy_menu
 */
@Mapper
public interface SyMenuMapper {

    /**
     * Tìm menu theo menuNo
     * 
     * @param menuNo Mã menu
     * @return SyMenu object hoặc null
     */
    SyMenu findByMenuNo(@Param("menuNo") String menuNo);

    /**
     * Tìm menus theo menuParentNo
     * 
     * @param menuParentNo Mã menu cha
     * @return List<SyMenu>
     */
    List<SyMenu> findByParentNo(@Param("menuParentNo") String menuParentNo);

    /**
     * Lấy danh sách menus hoạt động
     * 
     * @return List<SyMenu>
     */
    List<SyMenu> findAllActive();

    /**
     * Lấy menu tree (cây menu)
     * 
     * @return List<SyMenu>
     */
    List<SyMenu> findMenuTree();

    /**
     * Lấy menu tree theo roleNo (có quyền)
     * 
     * @param roleNo Mã vai trò
     * @return List<SyMenu>
     */
    List<SyMenu> findMenuTreeByRoleNo(@Param("roleNo") String roleNo);

    /**
     * Lấy menu tree theo userNo (có quyền)
     * 
     * @param userNo Mã người dùng
     * @return List<SyMenu>
     */
    List<SyMenu> findMenuTreeByUserNo(@Param("userNo") String userNo);

    /**
     * Kiểm tra menu có tồn tại và hoạt động không
     * 
     * @param menuNo Mã menu
     * @return true nếu tồn tại và hoạt động
     */
    boolean existsAndActive(@Param("menuNo") String menuNo);

    // CRUD for Management
    List<com.ait.sy.basicMaintenance.dto.SyMenuDto> findAll(@Param("keyword") String keyword);

    void insert(SyMenu menu);

    void update(SyMenu menu);

    void deleteByMenuNo(@Param("menuNo") String menuNo);

    String getNextGlobalNoSeq();
}
