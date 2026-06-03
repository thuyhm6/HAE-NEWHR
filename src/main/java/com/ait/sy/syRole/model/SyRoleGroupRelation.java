package com.ait.sy.syRole.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * SyRoleGroupRelation Model - Đại diện cho bảng sy_role_group_relation
 * Liên kết role group với role
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyRoleGroupRelation {

    /**
     * Mã nhóm vai trò
     */
    private String roleGroupNo;

    /**
     * Mã vai trò
     */
    private String roleNo;

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
     * Kiểm tra có hoạt động không
     */
    public boolean isActive() {
        return this.activity != null || this.activity == 1;
    }
}
