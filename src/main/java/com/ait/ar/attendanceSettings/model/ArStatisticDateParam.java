package com.ait.ar.attendanceSettings.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Model cho bảng AR_STATISTIC_DATE_PARAM - Bảng thông số khoảng thời gian chấm
 * công
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArStatisticDateParam {

    /**
     * PARAM_NO - ID tự tăng
     */
    private String paramNo;

    /**
     * STAT_NO - Khoảng mã
     */
    private String statNo;

    /**
     * CPNY_ID - Mã công ty
     */
    private String cpnyId;

    /**
     * START_DATE - Ngày bắt đầu
     */
    private String startDate;

    /**
     * END_DATE - Ngày kết thúc
     */
    private String endDate;

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
     * ACTIVITY - Trạng thái hoạt động
     */
    private Integer activity;

    /**
     * ORDERNO - Sắp xếp
     */
    private Integer orderno;
}
