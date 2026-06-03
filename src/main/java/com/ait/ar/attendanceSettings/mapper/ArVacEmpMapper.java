package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArVacEmpDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ArVacEmpMapper {
    List<ArVacEmpDto> selectVacEmpList(ArVacEmpDto params);
}
