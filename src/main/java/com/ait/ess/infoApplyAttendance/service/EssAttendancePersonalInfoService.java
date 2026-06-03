package com.ait.ess.infoApplyAttendance.service;

import com.ait.ess.infoApplyAttendance.dto.EssAttendancePersonalInfoDto;

import java.util.List;

public interface EssAttendancePersonalInfoService {
    List<EssAttendancePersonalInfoDto> getPersonalAttendanceList(EssAttendancePersonalInfoDto dto);
    List<EssAttendancePersonalInfoDto> getAttendanceItemList();
}
