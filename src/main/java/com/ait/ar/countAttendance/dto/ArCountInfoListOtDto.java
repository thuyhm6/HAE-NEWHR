package com.ait.ar.countAttendance.dto;

import com.ait.hrm.empinfo.dto.EmployeeNameDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Tổng hợp tăng ca theo tháng của nhân viên (tab "Tăng ca" của
 * /ar/countAttendance/arCountInfoList). Mỗi row = 1 nhân viên, các cột
 * OT_M{thang}... lấy từ hàm GET_AR_OT_TOTAIL theo mã hạng mục tổng hợp
 * (xem ArCountInfoListMapper.xml).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ArCountInfoListOtDto extends EmployeeNameDto {
    private String teamName;
    private String year;
    private String otTotal;

    private String otM1Total;
    private String otM1NormalWork;
    private String otM1Saturday;
    private String otM1WeeklyHoliday;
    private String otM1PublicHoliday;
    private String otM2Total;
    private String otM2NormalWork;
    private String otM2Saturday;
    private String otM2WeeklyHoliday;
    private String otM2PublicHoliday;
    private String otM3Total;
    private String otM3NormalWork;
    private String otM3Saturday;
    private String otM3WeeklyHoliday;
    private String otM3PublicHoliday;
    private String otM4Total;
    private String otM4NormalWork;
    private String otM4Saturday;
    private String otM4WeeklyHoliday;
    private String otM4PublicHoliday;
    private String otM5Total;
    private String otM5NormalWork;
    private String otM5Saturday;
    private String otM5WeeklyHoliday;
    private String otM5PublicHoliday;
    private String otM6Total;
    private String otM6NormalWork;
    private String otM6Saturday;
    private String otM6WeeklyHoliday;
    private String otM6PublicHoliday;
    private String otM7Total;
    private String otM7NormalWork;
    private String otM7Saturday;
    private String otM7WeeklyHoliday;
    private String otM7PublicHoliday;
    private String otM8Total;
    private String otM8NormalWork;
    private String otM8Saturday;
    private String otM8WeeklyHoliday;
    private String otM8PublicHoliday;
    private String otM9Total;
    private String otM9NormalWork;
    private String otM9Saturday;
    private String otM9WeeklyHoliday;
    private String otM9PublicHoliday;
    private String otM10Total;
    private String otM10NormalWork;
    private String otM10Saturday;
    private String otM10WeeklyHoliday;
    private String otM10PublicHoliday;
    private String otM11Total;
    private String otM11NormalWork;
    private String otM11Saturday;
    private String otM11WeeklyHoliday;
    private String otM11PublicHoliday;
    private String otM12Total;
    private String otM12NormalWork;
    private String otM12Saturday;
    private String otM12WeeklyHoliday;
    private String otM12PublicHoliday;

    // Filter params
    private String keyword;
    private String deptNos;
    private String empTypeCode;
    private String startTime;
}
