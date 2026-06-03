package com.ait.ar.attendanceSettings.service;

import java.util.List;

import com.ait.ar.attendanceSettings.dto.ArItemParamDto;

public interface ArItemParamService {
    List<ArItemParamDto> getParamList(String itemNo);

    ArItemParamDto getParamById(String arParamNo);

    void saveParam(ArItemParamDto dto);

    void deleteParam(String arParamNo);

    List<ArItemParamDto> getArItemOptions(String type);
}
