package com.ait.sy.sys.service.impl;

import com.ait.sy.basicMaintenance.mapper.SyMenuMapper;
import com.ait.sy.basicMaintenance.model.SyMenu;
import com.ait.sy.syRole.mapper.SyRoleGroupMapper;
import com.ait.sy.syRole.mapper.SyRoleMapper;
import com.ait.sy.syRole.mapper.SyRoleRelationMapper;
import com.ait.sy.syRole.mapper.SyUserRelationMapper;
import com.ait.sy.syRole.model.SyRole;
import com.ait.sy.syRole.model.SyRoleGroup;
import com.ait.sy.syRole.model.SyUserRelation;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import com.ait.sy.sys.service.PermissionService;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PermissionServiceImpl implements PermissionService {

    private static final Logger logger = LoggerFactory.getLogger(PermissionServiceImpl.class);

    @Autowired
    private SyUserRelationMapper syUserRelationMapper;

    @Autowired
    private SyRoleGroupMapper syRoleGroupMapper;

    @Autowired
    private SyRoleMapper syRoleMapper;

    @Autowired
    private SyMenuMapper syMenuMapper;

    @Autowired
    private SyRoleRelationMapper syRoleRelationMapper;

    @Override
    @Cacheable(value = "userPermissions", key = "#userNo + '_roleGroups'")
    public List<SyRoleGroup> getUserRoleGroups(String userNo) {
        try {
            logger.debug("Getting role groups for user={}", userNo);

            List<SyUserRelation> userRelations = syUserRelationMapper.findActiveByUserNo(userNo);
            List<SyRoleGroup> roleGroups = userRelations.stream()
                    .map(relation -> syRoleGroupMapper.findByRoleGroupNo(relation.getRoleGroupNo()))
                    .filter(roleGroup -> roleGroup != null && roleGroup.isActive())
                    .collect(Collectors.toList());

            logger.debug("Found {} role groups for user={}", roleGroups.size(), userNo);
            return roleGroups;
        } catch (Exception e) {
            logger.error("Error getting role groups for user={}", userNo, e);
            throw new RuntimeException("Loi he thong khi lay role groups.", e);
        }
    }

    @Override
    @Cacheable(value = "userPermissions", key = "#userNo + '_roles'")
    public List<SyRole> getUserRoles(String userNo) {
        try {
            logger.debug("Getting roles for user={}", userNo);

            List<SyRoleGroup> roleGroups = getUserRoleGroups(userNo);
            List<SyRole> roles = roleGroups.stream()
                    .flatMap(roleGroup -> syRoleMapper.findByRoleGroupNo(roleGroup.getRoleGroupNo()).stream())
                    .filter(role -> role != null && role.isActive() && isMenuRole(role))
                    .distinct()
                    .collect(Collectors.toList());

            logger.debug("Found {} roles for user={}", roles.size(), userNo);
            return roles;
        } catch (Exception e) {
            logger.error("Error getting roles for user={}", userNo, e);
            throw new RuntimeException("Loi he thong khi lay roles.", e);
        }
    }

    @Override
    @Cacheable(value = "menuCache", key = "#userNo + '_menus'")
    public List<SyMenu> getUserMenus(String userNo) {
        try {
            logger.debug("Getting menus for user={}", userNo);
            List<SyMenu> menus = syMenuMapper.findMenuTreeByUserNo(userNo);
            logger.debug("Found {} menus for user={}", menus.size(), userNo);
            return menus;
        } catch (Exception e) {
            logger.error("Error getting menus for user={}", userNo, e);
            throw new RuntimeException("Loi he thong khi lay menus.", e);
        }
    }

    @Override
    @Cacheable(value = "menuCache", key = "#userNo + '_menuTree'")
    public List<SyMenu> getUserMenuTree(String userNo) {
        try {
            logger.debug("Getting menu tree for user={}", userNo);
            List<SyMenu> menuTree = syMenuMapper.findMenuTreeByUserNo(userNo);
            logger.debug("Found {} menu items in tree for user={}", menuTree.size(), userNo);
            return menuTree;
        } catch (Exception e) {
            logger.error("Error getting menu tree for user={}", userNo, e);
            throw new RuntimeException("Loi he thong khi lay menu tree.", e);
        }
    }

    @Override
    public boolean hasMenuPermission(String userNo, String menuNo) {
        try {
            List<SyRole> roles = getUserRoles(userNo);
            return roles.stream().anyMatch(role -> syRoleRelationMapper.hasPermission(role.getRoleNo(), menuNo));
        } catch (Exception e) {
            logger.error("Error checking menu permission userNo={} menuNo={}", userNo, menuNo, e);
            throw new RuntimeException("Loi he thong khi kiem tra quyen menu.", e);
        }
    }

    @Override
    public boolean hasSelectPermission(String userNo, String menuNo) {
        try {
            List<SyRole> roles = getUserRoles(userNo);
            return roles.stream().anyMatch(role -> syRoleRelationMapper.hasSelectPermission(role.getRoleNo(), menuNo));
        } catch (Exception e) {
            logger.error("Error checking SELECT permission userNo={} menuNo={}", userNo, menuNo, e);
            throw new RuntimeException("Loi he thong khi kiem tra quyen SELECT.", e);
        }
    }

    @Override
    public boolean hasInsertPermission(String userNo, String menuNo) {
        try {
            List<SyRole> roles = getUserRoles(userNo);
            return roles.stream().anyMatch(role -> syRoleRelationMapper.hasInsertPermission(role.getRoleNo(), menuNo));
        } catch (Exception e) {
            logger.error("Error checking INSERT permission userNo={} menuNo={}", userNo, menuNo, e);
            throw new RuntimeException("Loi he thong khi kiem tra quyen INSERT.", e);
        }
    }

    @Override
    public boolean hasUpdatePermission(String userNo, String menuNo) {
        try {
            List<SyRole> roles = getUserRoles(userNo);
            return roles.stream().anyMatch(role -> syRoleRelationMapper.hasUpdatePermission(role.getRoleNo(), menuNo));
        } catch (Exception e) {
            logger.error("Error checking UPDATE permission userNo={} menuNo={}", userNo, menuNo, e);
            throw new RuntimeException("Loi he thong khi kiem tra quyen UPDATE.", e);
        }
    }

    @Override
    public boolean hasDeletePermission(String userNo, String menuNo) {
        try {
            List<SyRole> roles = getUserRoles(userNo);
            return roles.stream().anyMatch(role -> syRoleRelationMapper.hasDeletePermission(role.getRoleNo(), menuNo));
        } catch (Exception e) {
            logger.error("Error checking DELETE permission userNo={} menuNo={}", userNo, menuNo, e);
            throw new RuntimeException("Loi he thong khi kiem tra quyen DELETE.", e);
        }
    }

    @Override
    @Cacheable(value = "userPermissions", key = "#userNo + '_permissionInfo'")
    public PermissionService.UserPermissionInfo getUserPermissionInfo(String userNo) {
        try {
            logger.debug("Getting permission info for user={}", userNo);

            List<SyRoleGroup> roleGroups = getUserRoleGroups(userNo);
            List<SyRole> roles = getUserRoles(userNo);
            List<SyMenu> menus = getUserMenus(userNo);

            HrUserInfo hrUserInfo = null;
            PermissionService.UserPermissionInfo permissionInfo =
                    new PermissionService.UserPermissionInfo(userNo, roleGroups, roles, menus, hrUserInfo);

            logger.debug(
                    "Built permission info for user={} with {} role groups, {} roles, {} menus",
                    userNo,
                    roleGroups.size(),
                    roles.size(),
                    menus.size());

            return permissionInfo;
        } catch (Exception e) {
            logger.error("Error getting permission info for user={}", userNo, e);
            throw new RuntimeException("Loi he thong khi lay thong tin phan quyen.", e);
        }
    }

    @CacheEvict(value = { "userPermissions", "menuCache" }, key = "#userNo + '*', allEntries = false")
    public void clearUserCache(String userNo) {
        logger.info("Clearing cache for user={}", userNo);
    }

    @CacheEvict(value = { "userPermissions", "menuCache" }, allEntries = true)
    public void clearAllPermissionCache() {
        logger.warn("Clearing all permission caches");
    }

    private boolean isMenuRole(SyRole role) {
        return "1".equals(role.getSysType());
    }
}
