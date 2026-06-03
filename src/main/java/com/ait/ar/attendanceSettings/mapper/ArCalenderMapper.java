package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArCalenderDto;
import com.ait.ar.attendanceSettings.dto.ArEmpCalenderDto;
import com.ait.ar.attendanceSettings.model.ArCalender;
import com.ait.ar.attendanceSettings.model.ArCalenderGroup;
import com.ait.ar.attendanceSettings.dto.ArCalenderGroupDto;
import com.ait.ar.attendanceMintenance.model.ArScheduleHtsv;
import com.ait.ar.attendanceSettings.model.ArCalenderGroupHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArCalenderMapper {
        // AR_CALENDER
        List<ArCalenderDto> findAll(@Param("iyear") String iyear,
                        @Param("imonth") String imonth,
                        @Param("keyword") String keyword);

        List<ArCalenderDto> findByMonth(@Param("iyear") String iyear,
                        @Param("imonth") String imonth);

        ArCalender selectByPk(@Param("ddateStr") String ddateStr);

        int countByPk(@Param("ddateStr") String ddateStr);

        void insert(ArCalender entity);

        void update(ArCalender entity);

        void delete(@Param("ddateStr") String ddateStr);

        // AR_CALENDER_GROUP
        List<ArCalenderGroup> findGroupByDate(@Param("arDateStr") String arDateStr);

        int countGroup(@Param("arDateStr") String arDateStr, @Param("groupId") String groupId);

        void insertGroup(ArCalenderGroup entity);

        void updateGroup(ArCalenderGroup entity);

        // AR_CALENDER_GROUP_HISTORY
        void deleteHistory(@Param("arDateStr") String arDateStr);

        void insertHistory(ArCalenderGroupHistory entity);

        // --- Class Calendar Additions ---

        List<ArCalenderGroup> findGroupByGroupId(
                @Param("arDateStr") String arDateStr, @Param("groupId") String groupId);
        
        List<ArCalenderGroupDto> selectGroupCalendarMonth(
                @Param("iyear") String iyear,
                @Param("imonth") String imonth,
                @Param("groupId") String groupId);

        ArCalenderGroupDto selectGroupCalendarDetail(
                @Param("arDateStr") String arDateStr,
                @Param("groupId") String groupId);

        void callAddCalenderDateBanciP(
                @Param("startDate") String startDate,
                @Param("endDate") String endDate,
                @Param("workShift") String workShift,
                @Param("restShift") String restShift,
                @Param("groupId") String groupId);
                
        void deleteHistoryByGroup(
                @Param("arDateStr") String arDateStr,
                @Param("groupId") String groupId);

        // --- Emp Calendar Additions ---

        List<ArEmpCalenderDto> selectEmpCalendarMonth(
                @Param("iyear") String iyear,
                @Param("imonth") String imonth,
                @Param("personId") String personId);

        // AR_SCHEDULE_HTSV: đếm xem đã có dữ liệu chưa
        int countScheduleHtsv(
                @Param("personId") String personId,
                @Param("arDateStr") String arDateStr);

        // AR_SCHEDULE_HTSV: lấy chi tiết 1 ngày của 1 người
        ArEmpCalenderDto selectEmpScheduleDetail(
                @Param("personId") String personId,
                @Param("arDateStr") String arDateStr);

        // AR_SCHEDULE_HTSV: thêm mới
        void insertScheduleHtsv(ArScheduleHtsv entity);

        // AR_SCHEDULE_HTSV: cập nhật
        void updateScheduleHtsv(ArScheduleHtsv entity);
}
