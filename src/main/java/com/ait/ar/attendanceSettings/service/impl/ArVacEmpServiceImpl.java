package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArVacEmpDto;
import com.ait.ar.attendanceSettings.mapper.ArVacEmpMapper;
import com.ait.ar.attendanceSettings.service.ArVacEmpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ArVacEmpServiceImpl implements ArVacEmpService {

    @Autowired
    private ArVacEmpMapper arVacEmpMapper;

    @Override
    public List<ArVacEmpDto> getVacEmpList(ArVacEmpDto params) {
        ArVacEmpDto safeParams = params == null ? new ArVacEmpDto() : params;
        if (safeParams.getVacId() == null || safeParams.getVacId().trim().isEmpty()) {
            safeParams.setVacId(String.valueOf(LocalDate.now().getYear()));
        }
        return arVacEmpMapper.selectVacEmpList(safeParams);
    }
}
