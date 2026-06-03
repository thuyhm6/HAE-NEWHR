package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArShift010Dto;
import com.ait.ar.attendanceSettings.model.ArShift010;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArShift010Mapper {
    List<ArShift010Dto> findAll(@Param("cpnyId") String cpnyId, @Param("searchText") String searchText);

    ArShift010 selectByShiftNo(@Param("shiftNo") String shiftNo);

    void insert(ArShift010 entity);

    void update(ArShift010 entity);

    void delete(@Param("shiftNo") String shiftNo);
}
