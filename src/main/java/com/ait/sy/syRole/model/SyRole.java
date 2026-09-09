package com.ait.sy.syRole.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * SyRole Model - Đại diện cho bảng sy_role
 * Quản lý vai trò
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyRole {

    /**
     * Mã vai trò
     */
    private String roleNo;

    /**
     * ID vai trò
     */
    private String roleId;

    /**
     * ID công ty
     */
    private String cpnyId;

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
     * Loại hệ thống
     */
    private String sysType;

    /**
     * Kiểm tra có hoạt động không.
     * Sửa lỗi logic: code cũ dùng "activity != null || activity == 1" nên luôn trả về true với mọi
     * activity khác null (kể cả 0), khiến PermissionServiceImpl#filter coi role đã vô hiệu hóa vẫn là
     * active khi tính quyền menu - phải dùng "&&" mới đúng ý nghĩa "chỉ hoạt động khi activity = 1".
     */
    public boolean isActive() {
        return this.activity != null && this.activity == 1;
    }
}
