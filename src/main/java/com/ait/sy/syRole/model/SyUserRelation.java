package com.ait.sy.syRole.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * SyUserRelation Model - Đại diện cho bảng sy_user_relation
 * Liên kết user với role group
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyUserRelation {

    /**
     * Mã người dùng
     */
    private String userNo;

    /**
     * Mã nhóm vai trò
     */
    private String roleGroupNo;

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
