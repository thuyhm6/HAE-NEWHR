package com.ait.ar.attendanceSettings.service;

import java.util.List;

import com.ait.ar.attendanceSettings.dto.ArStatisticDateDto;

public interface ArStatisticDateService {
    List<ArStatisticDateDto> getCycleList(String statNo);

    ArStatisticDateDto getCycleById(String statNo);

    void saveCycle(ArStatisticDateDto dto);

    void deleteCycle(String statNo);
}
