package com.ait.sy.basicMaintenance.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Model cho bảng HR_COMPANY - Thông tin công ty
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrCompany {

    /**
     * CPNY_ID - ID công ty (khóa chính)
     */
    private String cpnyId;

    /**
     * CPNY_LOCATION - Vị trí công ty
     */
    private String cpnyLocation;

    /**
     * CPNY_NO - Mã số công ty
     */
    private String cpnyNo;

    /**
     * CPNY_ADDR - Địa chỉ công ty
     */
    private String cpnyAddr;

    /**
     * CPNY_POSTALCODE - Mã bưu điện
     */
    private String cpnyPostalcode;

    /**
     * CPNY_INTRO - Giới thiệu công ty
     */
    private String cpnyIntro;

    /**
     * CPNY_HISTORY - Lịch sử công ty
     */
    private String cpnyHistory;

    /**
     * CPNY_WEB_ADDR - Địa chỉ website
     */
    private String cpnyWebAddr;

    /**
     * CPNY_TEL_NO - Số điện thoại
     */
    private String cpnyTelNo;

    /**
     * CPNY_FAX_NO - Số fax
     */
    private String cpnyFaxNo;

    /**
     * OPERATION_ID - ID thao tác
     */
    private String operationId;

    /**
     * GGS_YN - Có phải GGS không (Y/N)
     */
    private String ggsYn;

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
    public HrCompany(String cpnyId, String cpnyNo, String cpnyLocation, String createdBy) {
        this.cpnyId = cpnyId;
        this.cpnyNo = cpnyNo;
        this.cpnyLocation = cpnyLocation;
        this.createdBy = createdBy;
        this.createDate = LocalDateTime.now();
        this.updateDate = LocalDateTime.now();
        this.activity = "1";
        this.orderNo = 0;
        this.ggsYn = "N";
    }
}
