package com.ait.ess.viewDept.mapper;

import com.ait.ess.viewDept.dto.WeeklyDeptCountDto;
import com.ait.ess.viewDept.dto.WeeklyJoinResignDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WeeklyHrReportMapper {

    List<WeeklyDeptCountDto> selectDeptCounts(@Param("weekEndDate") String weekEndDate);

    List<WeeklyJoinResignDto> selectJoinResignByPostGrade(@Param("weekStart") String weekStart,
                                                            @Param("weekEnd") String weekEnd);
}
