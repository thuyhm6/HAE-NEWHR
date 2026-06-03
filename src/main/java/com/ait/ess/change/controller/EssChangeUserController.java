package com.ait.ess.change.controller;

import com.ait.sy.sys.service.HrAuthenticationService;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import com.ait.sy.sys.service.PermissionService;
import com.ait.sy.sys.service.MenuService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpSession;
import java.util.Collections;

@Controller
@RequestMapping("/ess/change")
public class EssChangeUserController {

    private static final Logger log = LoggerFactory.getLogger(EssChangeUserController.class);

    @Autowired
    private HrAuthenticationService hrAuthenticationService;

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private MenuService menuService;

    @GetMapping("/changeUser")
    public String changeUserPage(Model model, HttpSession session) {
        return "ess/change/changeUser";
    }

    /**
     * Thay đổi người đăng nhập sang personId của nhân viên được chọn.
     * Cập nhật adminID + currentHrUser trong session → toàn bộ hệ thống
     * nhận diện người B là người đang đăng nhập.
     */
    @PostMapping("/api/changeUser")
    @ResponseBody
    public ResponseEntity<?> changeUser(@RequestParam String personId, HttpSession session) {
        try {
            if (session.getAttribute("isLoggedIn") == null) {
                return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            }
            if (personId == null || personId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "personId không hợp lệ"));
            }

            String trimmedPersonId = personId.trim();
            String previousAdminId = (String) session.getAttribute("adminID");

            // Cập nhật adminID → intercept MyBatis inject đúng người B
            session.setAttribute("adminID", trimmedPersonId);

            // Cập nhật currentHrUser nếu người B có tài khoản hệ thống
            HrUserInfo newUserInfo = hrAuthenticationService.findByPersonId(trimmedPersonId);
            if (newUserInfo != null) {
                session.setAttribute("currentHrUser", newUserInfo);
                // Cập nhật phân quyền theo tài khoản người B
                String userNo = newUserInfo.getSyUser().getUserNo();
                session.setAttribute("currentPermissionInfo", permissionService.getUserPermissionInfo(userNo));
                session.setAttribute("hasSysTypeZeroMenus",
                        menuService.hasMenusByUserPermissionBySysType(userNo, "0"));
                log.info("EssChangeUser: full switch from [{}] to [{}] (userNo={})", previousAdminId, trimmedPersonId, userNo);
            } else {
                // Người B không có tài khoản hệ thống: chỉ đổi adminID để ESS queries dùng đúng dữ liệu
                log.info("EssChangeUser: adminID-only switch from [{}] to [{}] (no system account)", previousAdminId, trimmedPersonId);
            }

            return ResponseEntity.ok(Collections.singletonMap("message", "Thay đổi người dùng thành công"));
        } catch (Exception e) {
            log.error("Lỗi thay đổi người dùng ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống: " + e.getMessage()));
        }
    }
}
