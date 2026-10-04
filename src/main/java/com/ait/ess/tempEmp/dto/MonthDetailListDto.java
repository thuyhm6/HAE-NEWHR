package com.ait.ess.tempEmp.dto;

import lombok.Data;

/**
 * Tham số tìm kiếm / xuất báo cáo của màn hình ess/tempEmp/viewMonthDetailList.
 * Kết quả danh sách xem {@link MonthDetailResultDto}.
 */
@Data
public class MonthDetailListDto {

    // Tham số tìm kiếm
    private String keyword;
    private String quickFilter;
    private String deptNos;
    private String empTypeCode;
    /** Tháng (MM) */
    private String month;
    /** Năm (YYYY) */
    private String year;
    /** Khoảng ngày (YYYY/MM/DD) - giữ như form gốc, truyền cho các báo cáo cần dùng */
    private String startDate;
    private String endDate;

    // Tham số xuất báo cáo
    private String reportType;
    private String reportYear;
}
