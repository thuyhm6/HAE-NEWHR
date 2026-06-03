package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArScheduleHtsvDto;
import com.ait.ar.attendanceMintenance.model.ArScheduleHtsv;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ArScheduleHtsvMapper {
    List<ArScheduleHtsvDto> getList(Map<String, Object> params);
    ArScheduleHtsvDto getByPkNo(@Param("pkNo") Long pkNo);
    void insert(ArScheduleHtsv model);
    void update(ArScheduleHtsv model);
    void delete(@Param("pkNo") Long pkNo);
}
