package com.ait.sy.sys.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Model cho bảng SY_GLOBAL_NAME - Lưu trữ thông tin đa ngôn ngữ
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyGlobalName {

    /**
     * SEQ - Khóa chính tự tăng
     */
    private Long seq;

    /**
     * NO - Mã số liên kết với SY_CODE.CODE_NO
     */
    private String no;

    /**
     * LANGUAGE - Mã ngôn ngữ (zh, ko, en, vi)
     */
    private String language;

    /**
     * CONTENT - Nội dung đa ngôn ngữ
     */
    private String content;

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
     * ACTIVITY - Trạng thái hoạt động (Y/N)
     */
    private String activity;

    /**
     * ORDERNO - Thứ tự sắp xếp
     */
    private Integer orderNo;

    /**
     * Constructor cho việc tạo mới
     */
    public SyGlobalName(String no, String language, String content) {
        this.no = no;
        this.language = language;
        this.content = content;
        this.createDate = LocalDateTime.now();
        this.updateDate = LocalDateTime.now();
        this.activity = "1";
        this.orderNo = 0;
    }
}
