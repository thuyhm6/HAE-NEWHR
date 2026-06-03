package com.ait.ar.attendanceSettings.service;

import com.ait.ar.attendanceSettings.dto.ArCalenderDto;
import com.ait.ar.attendanceSettings.dto.ArCalenderGroupDto;
import com.ait.ar.attendanceSettings.dto.ArEmpCalenderDto;
import java.util.List;

public interface ArCalenderService {

    List<ArCalenderDto> getHolidayList(String iyear, String imonth, String keyword);

    List<ArCalenderDto> getCalendarMonth(int year, int month);

    ArCalenderDto getHolidayByPk(String ddateStr);

    void saveHoliday(ArCalenderDto dto);

    void deleteHoliday(String ddateStr);

    // --- Class Calendar ---

    List<ArCalenderGroupDto> getGroupCalendarMonth(int year, int month, String groupId);

    ArCalenderGroupDto getGroupCalendarDetail(String arDateStr, String groupId);

    void saveGroupCalendarBatch(String startDate, String endDate, String groupId, String workShift, String restShift);

    void updateGroupCalendarSingle(ArCalenderGroupDto dto);

    // --- Emp Calendar ---

    List<ArEmpCalenderDto> getEmpCalendarMonth(int year, int month, String personId);

    void saveEmpCalendarDay(ArEmpCalenderDto dto);

    ArEmpCalenderDto getEmpScheduleDetail(String personId, String arDateStr);
}
