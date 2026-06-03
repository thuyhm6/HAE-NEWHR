package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordDayDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ArCardRecordDayMapper {

    int countList(ArCardRecordDayDto dto);

    List<ArCardRecordDayDto> selectListPage(ArCardRecordDayDto dto);

    List<ArCardRecordDayDto> selectListAll(ArCardRecordDayDto dto);
}
