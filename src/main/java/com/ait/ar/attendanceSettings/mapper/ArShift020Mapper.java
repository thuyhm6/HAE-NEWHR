package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArShift020Dto;
import com.ait.ar.attendanceSettings.model.ArShift020;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArShift020Mapper {
    List<ArShift020Dto> findByShiftNo(@Param("shiftNo") String shiftNo);

    ArShift020 selectByPkNo(@Param("pkNo") Long pkNo);

    void insert(ArShift020 entity);

    void update(ArShift020 entity);

    void delete(@Param("pkNo") Long pkNo);

    Long getNextPkNoSeq();
}
