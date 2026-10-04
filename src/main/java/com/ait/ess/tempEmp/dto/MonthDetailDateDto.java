package com.ait.ess.tempEmp.dto;

import lombok.Data;

/**
 * Một ngày trong lịch tháng (AR_CALENDER) - dùng dựng header các cột chi tiết theo ngày.
 */
@Data
public class MonthDetailDateDto {

    /** Ngày dạng YYYY/MM/DD */
    private String ddateStr;
    /** Thứ trong tuần (0 = CN ... 6 = T7) */
    private Integer iweek;
    /** Loại ngày - 1440 là ngày làm việc */
    private String typeId;
    /** Ngày trong tháng */
    private Integer iday;
    /** Key cột chi tiết chấm công: DATE_n */
    private String dateKey;
    /** Key cột tăng ca ngày: DAY_OT_n */
    private String dayOtKey;
    /** Key cột tăng ca đêm: NIGHT_OT_n */
    private String nightOtKey;
    /** Tên thứ (Mon, Tues...) */
    private String weekTitle;
}
