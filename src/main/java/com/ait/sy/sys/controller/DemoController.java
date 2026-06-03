package com.ait.sy.sys.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import com.ait.sy.sys.service.PermissionService.UserPermissionInfo;

import jakarta.servlet.http.HttpSession;

/**
 * DemoController - Controller để demo hệ thống tab nội bộ
 */
@Controller
@RequestMapping("/demo")
public class DemoController {

    /**
     * Trang demo 1 - Quản lý nhân viên
     */
    @GetMapping("/page1")
    public String page1(Model model, HttpSession session) {
        // Lấy thông tin user từ session
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        UserPermissionInfo permissionInfo = (UserPermissionInfo) session.getAttribute("currentPermissionInfo");

        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("permissionInfo", permissionInfo);
        model.addAttribute("title", "Quản lý nhân viên - Demo");

        return "demo/page1";
    }

    /**
     * Trang demo 2 - Báo cáo thống kê
     */
    @GetMapping("/page2")
    public String page2(Model model, HttpSession session) {
        // Lấy thông tin user từ session
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        UserPermissionInfo permissionInfo = (UserPermissionInfo) session.getAttribute("currentPermissionInfo");

        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("permissionInfo", permissionInfo);
        model.addAttribute("title", "Báo cáo thống kê - Demo");

        return "demo/page2";
    }
}
