package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArAttendanceSearchDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ArAttendanceSearchMapper {
    List<ArAttendanceSearchDto> selectAttendanceSearchList(ArAttendanceSearchDto params);

    List<ArAttendanceSearchDto> selectAttendanceOtSearchList(ArAttendanceSearchDto params);

    void deleteArDetail(@Param("pkNo") String pkNo);
}
