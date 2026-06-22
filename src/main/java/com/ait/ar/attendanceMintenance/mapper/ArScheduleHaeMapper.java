package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArScheduleHaeDto;
import com.ait.ar.attendanceMintenance.model.ArScheduleHae;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ArScheduleHaeMapper {
    List<ArScheduleHaeDto> getList(Map<String, Object> params);
    ArScheduleHaeDto getByPkNo(@Param("pkNo") Long pkNo);
    void insert(ArScheduleHae model);
    void update(ArScheduleHae model);
    void delete(@Param("pkNo") Long pkNo);
}
