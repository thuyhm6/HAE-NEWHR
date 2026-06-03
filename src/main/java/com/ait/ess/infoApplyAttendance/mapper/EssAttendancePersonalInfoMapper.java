package com.ait.ess.infoApplyAttendance.mapper;

import com.ait.ess.infoApplyAttendance.dto.EssAttendancePersonalInfoDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface EssAttendancePersonalInfoMapper {
    List<EssAttendancePersonalInfoDto> selectPersonalAttendanceList(EssAttendancePersonalInfoDto dto);
    List<EssAttendancePersonalInfoDto> selectAttendanceItemList(EssAttendancePersonalInfoDto dto);
}
