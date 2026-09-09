package com.ait.sy.sys.controller;

import com.ait.sy.sys.service.PasswordUpdateService;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Password update controller.
 * Access requires a valid authenticated session.
 */
@Controller
@RequestMapping("/password")
public class PasswordUpdateController {
    private static final Logger log = LoggerFactory.getLogger(PasswordUpdateController.class);

    @Autowired
    private PasswordUpdateService passwordUpdateService;

    @PostMapping("/api/verify-old-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> verifyOldPassword(
            @RequestParam("oldPassword") String oldPassword,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            String userNo = getCurrentUserNo(session);
            if (userNo == null) {
                response.put("success", false);
                response.put("message", "User session not found");
                return ResponseEntity.badRequest().body(response);
            }

            boolean isValid = passwordUpdateService.verifyOldPassword(userNo, oldPassword);
            response.put("success", isValid);
            response.put("message", isValid ? "Current password is valid" : "Current password is invalid");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to verify current password", e);
            response.put("success", false);
            response.put("message", "System error");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/api/change-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> changePasswordFromModal(
            @RequestParam("oldPassword") String oldPassword,
            @RequestParam("newPassword") String newPassword,
            @RequestParam("confirmPassword") String confirmPassword,
            HttpSession session) {

        Map<String, Object> resp = new HashMap<>();
        try {
            String userNo = getCurrentUserNo(session);
            if (userNo == null || userNo.isEmpty()) {
                resp.put("success", false);
                resp.put("message", "Hết phiên làm việc, vui lòng đăng nhập lại.");
                return ResponseEntity.status(401).body(resp);
            }

            if (!newPassword.equals(confirmPassword)) {
                resp.put("success", false);
                resp.put("message", "Mật khẩu xác nhận không khớp.");
                return ResponseEntity.badRequest().body(resp);
            }

            if (!passwordUpdateService.isPasswordStrong(newPassword)) {
                resp.put("success", false);
                resp.put("message", "Mật khẩu phải ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
                return ResponseEntity.badRequest().body(resp);
            }

            if (!passwordUpdateService.verifyOldPassword(userNo, oldPassword)) {
                resp.put("success", false);
                resp.put("code", "OLD_PASSWORD_INCORRECT");
                resp.put("message", "Mật khẩu hiện tại không đúng.");
                return ResponseEntity.badRequest().body(resp);
            }

            if (newPassword.equals(oldPassword)) {
                resp.put("success", false);
                resp.put("code", "SAME_AS_OLD");
                resp.put("message", "Mật khẩu mới không được trùng với mật khẩu cũ.");
                return ResponseEntity.badRequest().body(resp);
            }

            if (passwordUpdateService.updatePassword(userNo, newPassword)) {
                log.info("Password changed via topbar modal for userNo={}", userNo);
                resp.put("success", true);
                resp.put("message", "Cập nhật mật khẩu thành công!");
                return ResponseEntity.ok(resp);
            }

            resp.put("success", false);
            resp.put("message", "Không thể cập nhật mật khẩu. Vui lòng thử lại.");
            return ResponseEntity.internalServerError().body(resp);
        } catch (Exception e) {
            log.error("Error changing password from topbar modal", e);
            resp.put("success", false);
            resp.put("message", "Lỗi hệ thống.");
            return ResponseEntity.internalServerError().body(resp);
        }
    }

    @PostMapping("/api/check-password-strength")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> checkPasswordStrength(
            @RequestParam("password") String password) {

        Map<String, Object> response = new HashMap<>();

        try {
            boolean isStrong = passwordUpdateService.isPasswordStrong(password);
            response.put("isStrong", isStrong);
            response.put("message", isStrong ? "Strong password"
                    : "Password must be at least 8 chars and include uppercase, lowercase, number, and special char");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to check password strength", e);
            response.put("isStrong", false);
            response.put("message", "Password check error");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private String getCurrentUserNo(HttpSession session) {
        if (session == null) {
            return null;
        }

        try {
            Object currentUser = session.getAttribute("currentHrUser");
            if (currentUser == null) {
                return null;
            }

            try {
                Object syUser = currentUser.getClass().getMethod("getSyUser").invoke(currentUser);
                if (syUser != null) {
                    return (String) syUser.getClass().getMethod("getUserNo").invoke(syUser);
                }
            } catch (Exception ignored) {
                return (String) session.getAttribute("userNo");
            }
        } catch (Exception ignored) {
            return null;
        }

        return null;
    }
}
