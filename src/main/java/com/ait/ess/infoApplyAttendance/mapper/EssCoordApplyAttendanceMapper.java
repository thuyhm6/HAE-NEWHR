package com.ait.ess.infoApplyAttendance.mapper;

import com.ait.ess.infoApplyAttendance.dto.EssCoordApplyAttendanceDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EssCoordApplyAttendanceMapper {

    int countList(EssCoordApplyAttendanceDto params);

    List<EssCoordApplyAttendanceDto> selectListPage(EssCoordApplyAttendanceDto params);
}
