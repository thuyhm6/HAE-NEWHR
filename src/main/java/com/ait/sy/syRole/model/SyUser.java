package com.ait.sy.syRole.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * SyUser Model - Đại diện cho bảng sy_user trong hệ thống HR
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyUser {

    /**
     * Mã người dùng
     */
    private String userNo;

    /**
     * ID cá nhân (liên kết với hr_employee)
     */
    private String personId;

    /**
     * ID công ty
     */
    private String cpnyId;

    /**
     * Tên đăng nhập
     */
    private String userName;

    /**
     * Mật khẩu (đã mã hóa)
     */
    private String password;

    /**
     * Tham số đặc biệt
     */
    private String specialParam;

    /**
     * Giá trị đặc biệt
     */
    private String specialValue;

    /**
     * Loại người dùng
     */
    private String userType;

    /**
     * Mật khẩu đầu tiên
     */
    private String passwordFirst;

    /**
     * Mật khẩu thứ hai
     */
    private String passwordSecond;

    /**
     * Mật khẩu thứ ba
     */
    private String passwordThird;

    /**
     * Ngày tạo
     */
    private LocalDateTime createDate;

    /**
     * Người tạo
     */
    private String createdBy;

    /**
     * Ngày cập nhật
     */
    private LocalDateTime updateDate;

    /**
     * Người cập nhật
     */
    private String updatedBy;

    /**
     * Thứ tự sắp xếp
     */
    private Integer orderNo;

    /**
     * Trạng thái hoạt động (1 = hoạt động, 0 = không hoạt động)
     */
    private Integer activity;

    /**
     * Cờ dữ liệu cá nhân
     */
    private String personalDataFlag;

    /**
     * Ngày cập nhật dữ liệu cá nhân
     */
    private LocalDateTime personalDataUpdateDate;

    /**
     * IP cập nhật dữ liệu cá nhân
     */
    private String personalDataUpdatedIp;

    /**
     * Người cập nhật dữ liệu cá nhân
     */
    private String personalDataUpdatedBy;

    /**
     * Cờ gửi dữ liệu cá nhân
     */
    private String personalSendDataFlag;

    /**
     * Ngày cập nhật gửi dữ liệu cá nhân
     */
    private LocalDateTime personalSendDataUpdateDate;

    /**
     * IP cập nhật gửi dữ liệu cá nhân
     */
    private String personalSendDataUpdatedIp;

    /**
     * Người cập nhật gửi dữ liệu cá nhân
     */
    private String personalSendDataUpdatedBy;

    /**
     * Tên nhân viên (Virtual)
     */
    private String empName;

    /**
     * Tên phòng ban (Virtual)
     */
    private String deptName;

    /**
     * Kiểm tra tài khoản có hoạt động không
     */
    public boolean isActive() {
        return this.activity != null && this.activity == 1;
    }

    /**
     * Kiểm tra mật khẩu đã được mã hóa BCrypt chưa.
     * Mật khẩu BCrypt luôn bắt đầu bằng $2a$, $2b$, hoặc $2y$
     */
    public boolean isPasswordEncrypted() {
        return this.password != null && this.password.matches("^\\$2[ayb]\\$.{56}$");
    }

    /**
     * Kiểm tra mật khẩu với BCrypt encoder
     * 
     * @param rawPassword     Mật khẩu thô từ user input
     * @param passwordEncoder BCrypt password encoder
     * @return true nếu mật khẩu đúng
     */
    public boolean matchesPassword(String rawPassword,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        // So sánh với password chính (BCrypt)
        if (this.password != null && passwordEncoder.matches(rawPassword, this.password)) {
            return true;
        }

        // So sánh với password phụ (BCrypt)
        if (this.passwordFirst != null && passwordEncoder.matches(rawPassword, this.passwordFirst)) {
            return true;
        }

        if (this.passwordSecond != null && passwordEncoder.matches(rawPassword, this.passwordSecond)) {
            return true;
        }

        if (this.passwordThird != null && passwordEncoder.matches(rawPassword, this.passwordThird)) {
            return true;
        }

        return false;
    }

    /**
     * Kiểm tra mật khẩu (backward compatibility - deprecated)
     * 
     * @deprecated Sử dụng matchesPassword(String, PasswordEncoder) thay thế
     */
    @Deprecated
    public boolean matchesPassword(String rawPassword) {
        // So sánh với password chính (plain text - chỉ để backward compatibility)
        if (this.password != null && this.password.equals(rawPassword)) {
            return true;
        }

        // So sánh với password phụ (plain text - chỉ để backward compatibility)
        if (this.passwordFirst != null && this.passwordFirst.equals(rawPassword)) {
            return true;
        }

        if (this.passwordSecond != null && this.passwordSecond.equals(rawPassword)) {
            return true;
        }

        if (this.passwordThird != null && this.passwordThird.equals(rawPassword)) {
            return true;
        }

        return false;
    }
}
