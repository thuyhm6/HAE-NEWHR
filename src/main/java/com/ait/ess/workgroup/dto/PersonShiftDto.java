package com.ait.ess.workgroup.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PersonShiftDto {

    // Kết quả truy vấn
    private String ddateStr;        // DDATE_STR  — Ngày (DD/MM/YYYY)
    private String overTypeIdName;  // OVERTYPEID_NAME — Trạng thái làm việc
    private String shiftName;       // SHIFT_NAME
    private String dateType;        // DATE_TYPE
    private String dateName;        // DATE_NAME — Loại ngày
    private String shiftStartTime;  // SHIFT_START_TIME
    private String shiftEndTime;    // SHIFT_END_TIME
    private String indoorTime;      // INDOOR_TIME — Giờ vào
    private String outdoorTime;     // OUTDOOR_TIME — Giờ ra
    private String workHours;       // WORK_HOURS — Số giờ làm việc

    // Tham số filter (từ request)
    private String startDate;  // YYYY-MM-DD
    private String endDate;    // YYYY-MM-DD
}
