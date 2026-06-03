package com.ait.sy.basicMaintenance.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Model cho bảng SY_CODE - Bảng mã code phân cấp cha con
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyCode {

    /**
     * CODE_NO - Mã code (khóa chính)
     */
    private String codeNo;

    /**
     * DESCRIPTION - Mô tả
     */
    private String description;

    /**
     * DEPTH - Độ sâu phân cấp
     */
    private Integer depth;

    /**
     * PARENT_CODE_NO - Mã code cha
     */
    private String parentCodeNo;

    /**
     * OPERATION_ID - ID thao tác
     */
    private String operationId;

    /**
     * CREATE_DATE - Ngày tạo
     */
    private LocalDateTime createDate;

    /**
     * CREATED_BY - Người tạo
     */
    private String createdBy;

    /**
     * UPDATE_DATE - Ngày cập nhật
     */
    private LocalDateTime updateDate;

    /**
     * UPDATED_BY - Người cập nhật
     */
    private String updatedBy;

    /**
     * ORDERNO - Thứ tự sắp xếp
     */
    private Integer orderNo;

    /**
     * ACTIVITY - Trạng thái hoạt động (Y/N)
     */
    private String activity;

    /**
     * REMARK - Ghi chú
     */
    private String remark;

    /**
     * GROUP_CODE - Mã nhóm
     */
    private String groupCode;

    /**
     * CODE_ID - ID code
     */
    private String codeId;

    /**
     * Constructor cho việc tạo mới
     */
    public SyCode(String codeNo, String description, String parentCodeNo) {
        this.codeNo = codeNo;
        this.description = description;
        this.parentCodeNo = parentCodeNo;
        this.createDate = LocalDateTime.now();
        this.updateDate = LocalDateTime.now();
        this.activity = "1";
        this.orderNo = 0;
        this.depth = 0;
    }
}
