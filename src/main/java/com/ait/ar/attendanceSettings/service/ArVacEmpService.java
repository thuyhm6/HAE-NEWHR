package com.ait.ar.attendanceSettings.service;

import com.ait.ar.attendanceSettings.dto.ArVacEmpDto;

import java.util.List;

public interface ArVacEmpService {
    List<ArVacEmpDto> getVacEmpList(ArVacEmpDto params);
}
