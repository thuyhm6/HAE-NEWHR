package com.ait.ar.attendanceMintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Giới hạn tăng ca theo tháng của nhân viên (bảng AR_OVERTIME_LIMIT) - port từ
 * select "viewOverTimeLimit" (sqlArDetail.xml) dự án cũ. Dùng chung làm DTO kết
 * quả và tham số lọc tìm kiếm.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArOverTimeLimitDto {
    // ── Kết quả ────────────────────────────────────────────────────────
    private String otLimitNo;
    private String personId;
    private String empId;
    private String localName;
    private String deptNo;
    private String deptName;
    private String arMonthStr;
    private String otLimitMonth;
    private String otLimitYear;
    /** Tổng tăng ca năm nay (GET_AR_OT_TOTAIL type 2011). */
    private String otTotail;
    /** Tổng tăng ca tháng này (type 31). */
    private String otTotailMonth;
    /** Tăng ca ngày thường (type 311). */
    private String weekdayOtTotail;
    /** Tăng ca thứ 7 (type 312). */
    private String saturdayOtTotail;
    /** Tăng ca cuối tuần (type 314). */
    private String weekendOtTotail;
    /** Tăng ca ngày lễ (type 315). */
    private String hoildayOtTotail;
    private String updatedById;
    private String updateLocalName;
    private String updateDate;

    // ── Tham số lọc ────────────────────────────────────────────────────
    private String keyword;
    private String deptNos;
    /** Tháng bắt đầu dạng yyyyMM. */
    private String startMonth;
    /** Tháng kết thúc dạng yyyyMM. */
    private String endMonth;
    private String postFamily;
    private String filterOtLimitMonth;
    private String filterOtLimitYear;
    /** Thời gian tăng ca >= (giờ). */
    private String minOtHours;
}
