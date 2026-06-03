package com.ait.config;

import com.ait.sy.sys.service.MenuService;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import com.ait.sy.sys.service.PermissionService.UserPermissionInfo;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class LayoutModelAttributeAdvice {

    @Autowired
    private MenuService menuService;

    @ModelAttribute
    public void addLayoutAttributes(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        UserPermissionInfo permissionInfo = (UserPermissionInfo) session.getAttribute("currentPermissionInfo");
        Object hasSysTypeZeroMenus = session.getAttribute("hasSysTypeZeroMenus");

        if (currentHrUser != null) {
            model.addAttribute("currentHrUser", currentHrUser);
        }

        if (permissionInfo != null) {
            model.addAttribute("permissionInfo", permissionInfo);
        }

        boolean resolvedHasSysTypeZeroMenus = Boolean.TRUE.equals(hasSysTypeZeroMenus);
        if (hasSysTypeZeroMenus == null && currentHrUser != null && currentHrUser.getSyUser() != null) {
            resolvedHasSysTypeZeroMenus =
                    menuService.hasMenusByUserPermissionBySysType(currentHrUser.getSyUser().getUserNo(), "0");
            session.setAttribute("hasSysTypeZeroMenus", resolvedHasSysTypeZeroMenus);
        }

        model.addAttribute("hasSysTypeZeroMenus", resolvedHasSysTypeZeroMenus);
    }
}
