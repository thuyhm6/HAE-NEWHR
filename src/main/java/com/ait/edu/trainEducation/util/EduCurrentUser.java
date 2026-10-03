package com.ait.edu.trainEducation.util;

import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import javax.servlet.http.HttpSession;

/**
 * Thông tin người đăng nhập dùng cho phân quyền các màn đánh giá đào tạo.
 * Giữ nguyên quy tắc bản gốc (TrainEducationCtroller - Hanwha_HTSV): các mã NV
 * cố định dưới đây được xem toàn bộ khóa đào tạo; người khác chỉ thấy khóa mình
 * là giảng viên đánh giá / học viên.
 */
public final class EduCurrentUser {

    /** Quản trị hệ thống (bản gốc: 11111111, 11111112) - không tự đánh giá kết quả đào tạo. */
    public static final Set<String> ADMIN_EMPIDS =
            Collections.unmodifiableSet(new HashSet<>(Arrays.asList("11111111", "11111112")));

    /** Phụ trách đào tạo (bản gốc: 30100104, 40110008). */
    public static final Set<String> OFFICER_EMPIDS =
            Collections.unmodifiableSet(new HashSet<>(Arrays.asList("30100104", "40110008")));

    /**
     * Phụ trách đào tạo theo PERSON_ID - màn Tình hình đăng ký (makerSituation bản gốc:
     * 2000560, 2000889) được xem đơn của mọi học viên thuộc danh sách dự kiến.
     */
    public static final Set<String> SITUATION_PERSON_IDS =
            Collections.unmodifiableSet(new HashSet<>(Arrays.asList("2000560", "2000889")));

    private EduCurrentUser() {
    }

    private static HrUserInfo user() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return null;
        }
        HttpSession session = attrs.getRequest().getSession(false);
        return session == null ? null : (HrUserInfo) session.getAttribute("currentHrUser");
    }

    public static String empid() {
        HrUserInfo u = user();
        return u != null && u.getHrEmployee() != null ? u.getHrEmployee().getEmpId() : null;
    }

    public static String personId() {
        HrUserInfo u = user();
        return u != null ? u.getPersonId() : null;
    }

    public static String name() {
        HrUserInfo u = user();
        return u != null ? u.getEmployeeName() : null;
    }

    public static boolean isAdmin() {
        return ADMIN_EMPIDS.contains(empid());
    }

    public static boolean isOfficer() {
        return OFFICER_EMPIDS.contains(empid());
    }

    /** Được xem toàn bộ khóa đào tạo (quản trị hoặc phụ trách đào tạo). */
    public static boolean isPrivileged() {
        return isAdmin() || isOfficer();
    }

    /** Được xem tình hình đăng ký của mọi học viên (makerSituation). */
    public static boolean isSituationManager() {
        return SITUATION_PERSON_IDS.contains(personId()) || isPrivileged();
    }
}
