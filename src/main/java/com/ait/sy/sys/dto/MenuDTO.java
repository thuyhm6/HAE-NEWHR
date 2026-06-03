package com.ait.sy.sys.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * MenuDTO - DTO cho menu có phân cấp
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuDTO {

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
     * Tên menu (hiển thị)
     */
    private String menuName;

    /**
     * Hình ảnh menu
     */
    private String menuImg;

    /**
     * URL menu
     */
    private String menuUrl;

    /**
     * Độ sâu menu
     */
    private Integer depth;

    /**
     * Thứ tự sắp xếp
     */
    private Integer orderNo;

    /**
     * Trạng thái hoạt động
     */
    private Integer activity;

    /**
     * Danh sách menu con
     */
    private List<MenuDTO> children;

    /**
     * Kiểm tra có hoạt động không
     */
    public boolean isActive() {
        return this.activity != null && this.activity == 1;
    }

    /**
     * Kiểm tra có phải menu gốc không
     */
    public boolean isRootMenu() {
        return menuParentNo == null || menuParentNo.trim().isEmpty() || menuParentNo.trim().equals("0");
    }

    /**
     * Kiểm tra có phải menu con không
     */
    public boolean isChildMenu() {
        return !isRootMenu();
    }

    /**
     * Kiểm tra có menu con không
     */
    public boolean hasChildren() {
        return children != null && !children.isEmpty();
    }
}
