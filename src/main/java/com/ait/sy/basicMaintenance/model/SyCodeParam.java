package com.ait.sy.basicMaintenance.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Model cho bảng SY_CODE_PARAM - Bảng liên kết giữa SY_CODE và HR_COMPANY
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyCodeParam {

    /**
     * PARAM_NO - Mã tham số (khóa chính)
     */
    private String paramNo;

    /**
     * CODE_NO - Mã code (liên kết với SY_CODE.CODE_NO)
     */
    private String codeNo;

    /**
     * CPNY_ID - ID công ty (liên kết với HR_COMPANY.CPNY_ID)
     */
    private String cpnyId;

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
     * Constructor cho việc tạo mới
     */
    public SyCodeParam(String paramNo, String codeNo, String cpnyId) {
        this.paramNo = paramNo;
        this.codeNo = codeNo;
        this.cpnyId = cpnyId;
        this.createDate = LocalDateTime.now();
        this.updateDate = LocalDateTime.now();
        this.activity = "1";
        this.orderNo = 0;
    }
}
