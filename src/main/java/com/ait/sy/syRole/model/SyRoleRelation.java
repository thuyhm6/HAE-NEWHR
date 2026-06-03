package com.ait.sy.syRole.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * SyRoleRelation Model - Đại diện cho bảng sy_role_relation
 * Liên kết role với menu và quyền
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyRoleRelation {

    /**
     * Mã vai trò
     */
    private String roleNo;

    /**
     * Mã menu
     */
    private String menuNo;

    /**
     * Quyền SELECT
     */
    private String selectr;

    /**
     * Quyền INSERT
     */
    private String insertr;

    /**
     * Quyền UPDATE
     */
    private String updater;

    /**
     * Quyền DELETE
     */
    private String deleter;

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

    /**
     * Kiểm tra có quyền SELECT
     */
    public boolean hasSelectPermission() {
        return "Y".equals(this.selectr) || "1".equals(this.selectr);
    }

    /**
     * Kiểm tra có quyền INSERT
     */
    public boolean hasInsertPermission() {
        return "Y".equals(this.insertr) || "1".equals(this.insertr);
    }

    /**
     * Kiểm tra có quyền UPDATE
     */
    public boolean hasUpdatePermission() {
        return "Y".equals(this.updater) || "1".equals(this.updater);
    }

    /**
     * Kiểm tra có quyền DELETE
     */
    public boolean hasDeletePermission() {
        return "Y".equals(this.deleter) || "1".equals(this.deleter);
    }
}
