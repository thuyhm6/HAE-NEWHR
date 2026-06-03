package com.ait.sy.sys.service;

import com.ait.sy.basicMaintenance.model.SyMenu;
import com.ait.sy.syRole.model.SyRole;
import com.ait.sy.syRole.model.SyRoleGroup;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

import java.util.List;

/**
 * PermissionService - Interface cho xử lý phân quyền và menu
 */
public interface PermissionService {

    /**
     * Lấy danh sách role groups của user
     * 
     * @param userNo Mã người dùng
     * @return List<SyRoleGroup>
     */
    List<SyRoleGroup> getUserRoleGroups(String userNo);

    /**
     * Lấy danh sách roles của user
     * 
     * @param userNo Mã người dùng
     * @return List<SyRole>
     */
    List<SyRole> getUserRoles(String userNo);

    /**
     * Lấy danh sách menus có quyền của user
     * 
     * @param userNo Mã người dùng
     * @return List<SyMenu>
     */
    List<SyMenu> getUserMenus(String userNo);

    /**
     * Lấy menu tree có quyền của user
     * 
     * @param userNo Mã người dùng
     * @return List<SyMenu>
     */
    List<SyMenu> getUserMenuTree(String userNo);

    /**
     * Kiểm tra user có quyền trên menu không
     * 
     * @param userNo Mã người dùng
     * @param menuNo Mã menu
     * @return true nếu có quyền
     */
    boolean hasMenuPermission(String userNo, String menuNo);

    /**
     * Kiểm tra user có quyền SELECT trên menu không
     * 
     * @param userNo Mã người dùng
     * @param menuNo Mã menu
     * @return true nếu có quyền SELECT
     */
    boolean hasSelectPermission(String userNo, String menuNo);

    /**
     * Kiểm tra user có quyền INSERT trên menu không
     * 
     * @param userNo Mã người dùng
     * @param menuNo Mã menu
     * @return true nếu có quyền INSERT
     */
    boolean hasInsertPermission(String userNo, String menuNo);

    /**
     * Kiểm tra user có quyền UPDATE trên menu không
     * 
     * @param userNo Mã người dùng
     * @param menuNo Mã menu
     * @return true nếu có quyền UPDATE
     */
    boolean hasUpdatePermission(String userNo, String menuNo);

    /**
     * Kiểm tra user có quyền DELETE trên menu không
     * 
     * @param userNo Mã người dùng
     * @param menuNo Mã menu
     * @return true nếu có quyền DELETE
     */
    boolean hasDeletePermission(String userNo, String menuNo);

    /**
     * Lấy thông tin phân quyền đầy đủ của user
     * 
     * @param userNo Mã người dùng
     * @return UserPermissionInfo
     */
    UserPermissionInfo getUserPermissionInfo(String userNo);

    /**
     * Class chứa thông tin phân quyền đầy đủ của user
     */
    class UserPermissionInfo {
        private String userNo;
        private List<SyRoleGroup> roleGroups;
        private List<SyRole> roles;
        private List<SyMenu> menus;
        private HrUserInfo hrUserInfo;

        public UserPermissionInfo() {
        }

        public UserPermissionInfo(String userNo, List<SyRoleGroup> roleGroups,
                List<SyRole> roles, List<SyMenu> menus, HrUserInfo hrUserInfo) {
            this.userNo = userNo;
            this.roleGroups = roleGroups;
            this.roles = roles;
            this.menus = menus;
            this.hrUserInfo = hrUserInfo;
        }

        // Getters and Setters
        public String getUserNo() {
            return userNo;
        }

        public void setUserNo(String userNo) {
            this.userNo = userNo;
        }

        public List<SyRoleGroup> getRoleGroups() {
            return roleGroups;
        }

        public void setRoleGroups(List<SyRoleGroup> roleGroups) {
            this.roleGroups = roleGroups;
        }

        public List<SyRole> getRoles() {
            return roles;
        }

        public void setRoles(List<SyRole> roles) {
            this.roles = roles;
        }

        public List<SyMenu> getMenus() {
            return menus;
        }

        public void setMenus(List<SyMenu> menus) {
            this.menus = menus;
        }

        public HrUserInfo getHrUserInfo() {
            return hrUserInfo;
        }

        public void setHrUserInfo(HrUserInfo hrUserInfo) {
            this.hrUserInfo = hrUserInfo;
        }

        // Helper methods
        public boolean hasRole(String roleId) {
            return roles.stream().anyMatch(role -> roleId.equals(role.getRoleId()));
        }

        public boolean hasRoleGroup(String roleGroupId) {
            return roleGroups.stream().anyMatch(roleGroup -> roleGroupId.equals(roleGroup.getRoleGroupId()));
        }

        public boolean hasMenu(String menuCode) {
            return menus.stream().anyMatch(menu -> menuCode.equals(menu.getMenuCode()));
        }

        public boolean isAdmin() {
            return hasRole("ADMIN") || hasRoleGroup("ADMIN_GROUP");
        }

        public boolean isManager() {
            return hasRole("MANAGER") || hasRoleGroup("MANAGER_GROUP");
        }
    }
}
