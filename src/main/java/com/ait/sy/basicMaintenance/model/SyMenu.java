package com.ait.sy.basicMaintenance.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * SyMenu Model - Đại diện cho bảng sy_menu
 * Quản lý menu hệ thống
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyMenu {

    /**
     * Mã menu
     */
    private String menuNo;

    /**
     * Mã menu cha
     */
    private String menuParentNo;

    /**
     * Mã menu
     */
    private String menuCode;

    /**
     * Hình ảnh menu
     */
    private String menuImg;

    /**
     * Độ sâu menu
     */
    private Integer depth;

    /**
     * URL menu
     */
    private String menuUrl;

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
     * Kiểm tra có phải menu gốc không
     */
    public boolean isRootMenu() {
        return menuParentNo == null || menuParentNo.trim().isEmpty();
    }

    /**
     * Kiểm tra có phải menu con không
     */
    public boolean isChildMenu() {
        return !isRootMenu();
    }
}
