package com.ait.ess.tempEmp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Kết quả tra cứu chi tiết chấm công tháng: lịch tháng + danh sách nhân viên.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthDetailResultDto {

    /** Các ngày trong tháng (header cột chi tiết theo ngày) */
    private List<MonthDetailDateDto> dates;
    /** Danh sách nhân viên - key là tên cột SQL (EMPID, DATE_1, DAY_OT_1...) */
    private List<Map<String, Object>> rows;
}
