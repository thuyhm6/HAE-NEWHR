package com.ait.ess.viewDept.mapper;

import com.ait.ess.viewDept.dto.YearUseLeaveUsageDto;
import com.ait.ess.viewDept.dto.YearUseVacationDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface YearUseInfoMapper {
    List<YearUseVacationDto> selectVacationRowsByYear(@Param("year") String year);
    List<YearUseLeaveUsageDto> selectLeaveUsageByYear(@Param("year") String year);
}
