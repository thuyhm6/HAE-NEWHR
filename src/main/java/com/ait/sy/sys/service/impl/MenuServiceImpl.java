package com.ait.sy.sys.service.impl;

import com.ait.sy.sys.dto.MenuDTO;
import com.ait.sy.sys.mapper.MenuMapper;
import com.ait.sy.sys.service.MenuService;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * MenuServiceImpl - Implementation cua MenuService
 */
@Service
public class MenuServiceImpl implements MenuService {

    private static final String SYS_TYPE_MENU_ROOT = "2417";

    @Autowired
    private MenuMapper menuMapper;

    @Override
    public List<MenuDTO> getMenusByUserPermission(String userNo) {
        return getMenusByUserPermissionBySysType(userNo, "1");
    }

    @Override
    public List<MenuDTO> getMenusByUserPermissionBySysType(String userNo, String sysType) {
        if (userNo == null || userNo.trim().isEmpty()) {
            return new ArrayList<>();
        }

        if (sysType == null || sysType.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<MenuDTO> allMenus = menuMapper.getMenusByUserPermissionBySysType(userNo, sysType);
        return buildMenuTree(allMenus, sysType);
    }

    @Override
    public List<MenuDTO> getRootMenusByUserPermission(String userNo) {
        if (userNo == null || userNo.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<MenuDTO> rootMenus = menuMapper.getRootMenusByUserPermission(userNo);
        for (MenuDTO rootMenu : rootMenus) {
            rootMenu.setChildren(getChildMenus(rootMenu.getMenuNo(), userNo));
        }

        return rootMenus;
    }

    @Override
    public List<MenuDTO> getMenusByUserPermissionWithLanguage(String userNo, String language) {
        if (userNo == null || userNo.trim().isEmpty()) {
            return new ArrayList<>();
        }

        if (language == null || language.trim().isEmpty()) {
            language = "vi";
        }

        List<MenuDTO> allMenus = menuMapper.getMenusByUserPermissionWithLanguage(userNo, language);
        return buildMenuTree(allMenus, "1");
    }

    @Override
    public boolean hasMenusByUserPermissionBySysType(String userNo, String sysType) {
        if (userNo == null || userNo.trim().isEmpty()) {
            return false;
        }

        if (sysType == null || sysType.trim().isEmpty()) {
            return false;
        }

        return menuMapper.countMenusByUserPermissionBySysType(userNo, sysType) > 0;
    }

    private List<MenuDTO> buildMenuTree(List<MenuDTO> allMenus, String sysType) {
        List<MenuDTO> rootMenus = new ArrayList<>();

        for (MenuDTO menu : allMenus) {
            if (isDisplayRootMenu(menu, sysType)) {
                rootMenus.add(menu);
            }
        }

        for (MenuDTO rootMenu : rootMenus) {
            buildChildren(rootMenu, allMenus);
        }

        return rootMenus;
    }

    private boolean isDisplayRootMenu(MenuDTO menu, String sysType) {
        if (menu == null) {
            return false;
        }

        if ("1".equals(sysType)) {
            return SYS_TYPE_MENU_ROOT.equals(menu.getMenuParentNo());
        }

        return menu.isRootMenu();
    }

    private void buildChildren(MenuDTO parentMenu, List<MenuDTO> allMenus) {
        List<MenuDTO> children = new ArrayList<>();

        for (MenuDTO menu : allMenus) {
            if (parentMenu.getMenuNo().equals(menu.getMenuParentNo())) {
                children.add(menu);
                buildChildren(menu, allMenus);
            }
        }

        parentMenu.setChildren(children);
    }

    private List<MenuDTO> getChildMenus(String parentMenuNo, String userNo) {
        List<MenuDTO> childMenus = menuMapper.getChildMenusByUserPermission(userNo, parentMenuNo);
        for (MenuDTO childMenu : childMenus) {
            childMenu.setChildren(getChildMenus(childMenu.getMenuNo(), userNo));
        }

        return childMenus;
    }
}
