package com.ait.sy.sys.controller;

import com.ait.sy.basicMaintenance.model.SyMenu;
import com.ait.sy.sys.service.MenuService;
import com.ait.sy.sys.service.PasswordUpdateService;
import com.ait.sy.sys.service.PermissionService;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import com.ait.sy.sys.service.PermissionService.UserPermissionInfo;
import com.ait.sy.sys.service.impl.HrAuthenticationServiceImpl;
import com.ait.sy.sys.dto.CurrentUserDTO;
import com.ait.util.AngularIndexService;
import com.ait.util.CsrfUtil;
import com.ait.util.I18nUtil;
import com.ait.util.IpUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.support.RequestContextUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.util.Locale;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AuthController - Controller xử lý đăng nhập và xác thực
 */
@Controller
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private HrAuthenticationServiceImpl hrAuthenticationServiceImpl;

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private MenuService menuService;

    @Autowired
    private CsrfUtil csrfUtil;

    @Autowired
    private PasswordUpdateService passwordUpdateService;

    @Autowired
    private AngularIndexService angularIndexService;

    /**
     * Chặn cache trang login để tránh gửi lại csrfToken cũ sau khi session đã bị
     * invalidate (timeout/logout)
     */
    private void disableCache(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
    }

    /**
     * Hiển thị trang đăng nhập (main route)
     */
    @GetMapping("/login")
    public String loginPage(HttpSession session, HttpServletRequest request,
            HttpServletResponse response) throws java.io.IOException {
        // Không cho browser/proxy cache trang login, tránh việc form gửi lại
        // csrfToken cũ (đã hết hạn theo session cũ) sau khi timeout/logout
        disableCache(response);

        // Kiểm tra user đã đăng nhập chưa
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        if (currentHrUser != null) {
            return "redirect:/dashboard";
        }

        // Pre-warm CSRF token trong session (Angular sẽ tự gọi GET /api/csrf-token
        // để lấy token này, nhưng tạo sẵn ở đây tránh race điều kiện)
        csrfUtil.saveCsrfToken(session);
        log.info("[CSRF-DEBUG] GET /login sessionId={} isNew={} csrfToken={}", session.getId(), session.isNew(),
                maskToken(csrfUtil.getCsrfToken(session)));

        // Trang login giờ do Angular phục vụ (thay Thymeleaf)
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    /**
     * Che bớt token khi ghi log, chỉ giữ lại vài ký tự đầu để đối chiếu debug
     */
    private String maskToken(String token) {
        if (token == null) {
            return "null";
        }
        return token.length() > 8 ? token.substring(0, 8) + "...(len=" + token.length() + ")" : token;
    }

    /**
     * Hiển thị trang đăng nhập (alternative route)
     */
    @GetMapping("/auth/login")
    public String authLoginPage(HttpSession session, HttpServletRequest request,
            HttpServletResponse response) throws java.io.IOException {
        // Không cho browser/proxy cache trang login, tránh việc form gửi lại
        // csrfToken cũ (đã hết hạn theo session cũ) sau khi timeout/logout
        disableCache(response);

        // Kiểm tra user đã đăng nhập chưa
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        if (currentHrUser != null) {
            return "redirect:/dashboard";
        }

        // Pre-warm CSRF token trong session
        csrfUtil.saveCsrfToken(session);

        // Trang login giờ do Angular phục vụ (thay Thymeleaf)
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    /**
     * Thiết lập session sau khi xác thực thành công - dùng cho POST /api/auth/login (Angular). Trước đây
     * còn dùng chung với form POST /login (Thymeleaf, đã xoá) - nay chỉ còn 1 nơi gọi.
     */
    private void establishSession(HrUserInfo hrUserInfo, String lang, HttpServletRequest request,
            HttpServletResponse response, HttpSession session) {
        request.changeSessionId();
        session.setAttribute("currentHrUser", hrUserInfo);
        session.setAttribute("isLoggedIn", true);

        // Lưu ngôn ngữ đã chọn vào session (nếu có)
        if (lang != null && !lang.trim().isEmpty()) {
            session.setAttribute("language", lang.trim());
            // Đồng bộ Spring LocaleResolver để Thymeleaf dùng đúng locale (vi_VN, en_US...)
            // LocaleChangeInterceptor chỉ tạo Locale("vi") không có country code,
            // nên messages_vi_VN.properties sẽ không được tìm thấy nếu không override ở đây.
            Locale locale = I18nUtil.createLocale(lang.trim());
            LocaleResolver localeResolver = RequestContextUtils.getLocaleResolver(request);
            if (localeResolver != null) {
                localeResolver.setLocale(request, response, locale);
            }
        }

        // Lưu địa chỉ IP của client vào session
        String clientIp = IpUtil.getClientIpAddr(request);
        session.setAttribute("adminIP", clientIp);

        // Lưu ID cá nhân (PERSON_ID) vào session làm adminID
        session.setAttribute("adminID", hrUserInfo.getPersonId());

        // Lưu Company ID (CPNY_ID) vào session
        session.setAttribute("cpnyId", hrUserInfo.getSyUser().getCpnyId());

        // Lấy thông tin phân quyền đầy đủ
        UserPermissionInfo permissionInfo = permissionService
                .getUserPermissionInfo(hrUserInfo.getSyUser().getUserNo());
        session.setAttribute("currentPermissionInfo", permissionInfo);
        session.setAttribute("hasSysTypeZeroMenus",
                menuService.hasMenusByUserPermissionBySysType(hrUserInfo.getSyUser().getUserNo(), "0"));
    }

    /**
     * API lấy CSRF token + thông tin rate limiting cho Angular (trang login gọi
     * khi khởi tạo)
     */
    @GetMapping("/api/csrf-token")
    @ResponseBody
    public Map<String, Object> getCsrfTokenApi(HttpSession session, HttpServletRequest request) {
        csrfUtil.saveCsrfToken(session);
        Map<String, Object> resp = new HashMap<>();
        resp.put("csrfToken", csrfUtil.getCsrfToken(session));
        resp.put("remainingAttempts", hrAuthenticationServiceImpl.getRemainingLoginAttempts(request));
        resp.put("timeUntilReset", hrAuthenticationServiceImpl.getTimeUntilRateLimitReset(request));
        return resp;
    }

    /**
     * API đăng nhập JSON cho Angular - tái dùng nguyên logic xác thực/thiết lập
     * session của form login cũ (establishSession), chỉ khác định dạng
     * request/response.
     */
    @PostMapping(value = "/api/auth/login", consumes = "application/json")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> apiLogin(@RequestBody Map<String, String> body,
            HttpServletRequest request, HttpServletResponse response, HttpSession session) {

        String username = body.get("username");
        String password = body.get("password");
        String lang = body.get("lang");
        Map<String, Object> resp = new HashMap<>();

        if (!csrfUtil.validateCsrfToken(request)) {
            log.warn("CSRF token mismatch for /api/auth/login from IP: {}", IpUtil.getClientIpAddr(request));
            resp.put("success", false);
            resp.put("message", "Phiên làm việc không hợp lệ. Vui lòng tải lại trang.");
            return ResponseEntity.status(403).body(resp);
        }

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            resp.put("success", false);
            resp.put("message", "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
            return ResponseEntity.badRequest().body(resp);
        }

        try {
            HrUserInfo hrUserInfo = hrAuthenticationServiceImpl.authenticate(username.trim(), password, request,
                    session);

            if (hrUserInfo != null && hrUserInfo.isActive()) {
                establishSession(hrUserInfo, lang, request, response, session);
                resp.put("success", true);
                resp.put("redirectUrl", "/dashboard");
                resp.put("requirePasswordChange", Boolean.TRUE.equals(session.getAttribute("requirePasswordChange")));
                return ResponseEntity.ok(resp);
            }

            int remainingAttempts = hrAuthenticationServiceImpl.getRemainingLoginAttempts(request);
            long timeUntilReset = hrAuthenticationServiceImpl.getTimeUntilRateLimitReset(request);
            String errorMessage = "Tên đăng nhập hoặc mật khẩu không đúng, hoặc tài khoản không có quyền truy cập";
            if (remainingAttempts <= 2) {
                errorMessage += String.format(". Còn %d lần thử. Sau %d giây mới có thể thử lại.",
                        remainingAttempts, timeUntilReset);
            }
            resp.put("success", false);
            resp.put("message", errorMessage);
            resp.put("remainingAttempts", remainingAttempts);
            resp.put("timeUntilReset", timeUntilReset);
            return ResponseEntity.status(401).body(resp);
        } catch (SecurityException e) {
            resp.put("success", false);
            resp.put("message", "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.");
            return ResponseEntity.status(429).body(resp);
        } catch (Exception e) {
            log.error("Loi API dang nhap cho user [{}]", username, e);
            resp.put("success", false);
            resp.put("message", "Có lỗi xảy ra. Vui lòng thử lại sau.");
            return ResponseEntity.internalServerError().body(resp);
        }
    }

    /**
     * API lấy thông tin user hiện tại cho Angular (topbar, guard, modal đổi mật
     * khẩu lần đầu). Trả DTO riêng, không serialize thẳng HrUserInfo/SyUser vì
     * entity đó chứa field mật khẩu.
     */
    @GetMapping("/api/auth/me")
    @ResponseBody
    public ResponseEntity<CurrentUserDTO> getCurrentUser(HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        if (currentHrUser == null || currentHrUser.getSyUser() == null) {
            return ResponseEntity.status(401).build();
        }
        UserPermissionInfo permissionInfo = (UserPermissionInfo) session.getAttribute("currentPermissionInfo");
        CurrentUserDTO dto = new CurrentUserDTO(
                currentHrUser.getUsername(),
                currentHrUser.getEmployeeName(),
                currentHrUser.getPhotoUrl(),
                currentHrUser.getPersonId(),
                currentHrUser.getCpnyId(),
                currentHrUser.getSyUser().getUserType(),
                permissionInfo != null && permissionInfo.isAdmin(),
                Boolean.TRUE.equals(session.getAttribute("requirePasswordChange")),
                Boolean.TRUE.equals(session.getAttribute("hasSysTypeZeroMenus")));
        return ResponseEntity.ok(dto);
    }

    /**
     * API khóa màn hình - gọi khi client phát hiện idle timeout (30 phút không
     * thao tác). Vô hiệu hoá session ngay (giống logout) nhưng trả JSON 200 thay
     * vì redirect, để overlay khoá màn hình hiển thị tại chỗ (không mất trạng
     * thái trang đang xem). Nhờ session đã bị huỷ, nếu người dùng F5 lại trình
     * duyệt trong lúc đang khoá thì GET /api/auth/me sẽ trả 401 và authGuard tự
     * chuyển về /login thay vì cho phép "mở khoá" bằng cách refresh.
     */
    @PostMapping("/api/auth/lock")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> lockScreen(HttpSession session) {
        session.removeAttribute("currentHrUser");
        session.removeAttribute("currentPermissionInfo");
        session.removeAttribute("hasSysTypeZeroMenus");
        session.removeAttribute("isLoggedIn");
        session.invalidate();

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        return ResponseEntity.ok(resp);
    }

    /**
     * Đăng xuất
     */
    @GetMapping("/logout")
    public String logout(HttpSession session, RedirectAttributes redirectAttributes) {
        // Xóa session
        session.removeAttribute("currentHrUser");
        session.removeAttribute("currentPermissionInfo");
        session.removeAttribute("hasSysTypeZeroMenus");
        session.removeAttribute("isLoggedIn");
        session.invalidate();

        redirectAttributes.addFlashAttribute("success", "Đăng xuất thành công!");
        return "redirect:/login";
    }

    /**
     * API lấy menu tree cho user
     */
    @GetMapping("/api/menu-tree")
    @ResponseBody
    public List<SyMenu> getMenuTree(HttpSession session) {
        // Lấy thông tin user từ session (đã được kiểm tra bởi interceptor)
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        return permissionService.getUserMenuTree(currentHrUser.getSyUser().getUserNo());
    }

    /**
     * API đổi mật khẩu lần đầu (bắt buộc khi mật khẩu chưa mã hóa)
     */
    @PostMapping("/api/change-first-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> changeFirstPassword(
            @RequestParam("newPassword") String newPassword,
            @RequestParam("confirmPassword") String confirmPassword,
            HttpSession session) {

        Map<String, Object> resp = new HashMap<>();
        try {
            HrUserInfo currentUser = (HrUserInfo) session.getAttribute("currentHrUser");
            if (currentUser == null) {
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

            String userNo = currentUser.getSyUser().getUserNo();
            boolean updated = passwordUpdateService.updatePassword(userNo, newPassword);
            if (updated) {
                session.removeAttribute("requirePasswordChange");
                log.info("First-time password changed for userNo={}", userNo);
                resp.put("success", true);
                resp.put("message", "Đổi mật khẩu thành công!");
                return ResponseEntity.ok(resp);
            } else {
                resp.put("success", false);
                resp.put("message", "Không thể cập nhật mật khẩu. Vui lòng thử lại.");
                return ResponseEntity.internalServerError().body(resp);
            }
        } catch (Exception e) {
            log.error("Error changing first password", e);
            resp.put("success", false);
            resp.put("message", "Lỗi hệ thống.");
            return ResponseEntity.internalServerError().body(resp);
        }
    }
}
