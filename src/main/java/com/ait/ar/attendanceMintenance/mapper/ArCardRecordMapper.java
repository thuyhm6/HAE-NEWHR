package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ArCardRecordMapper {

    int countList(ArCardRecordDto dto);

    java.util.List<ArCardRecordDto> selectListPage(ArCardRecordDto dto);

    ArCardRecordDto getByRecordNo(@Param("recordNo") Long recordNo);

    int insertRecord(ArCardRecordDto dto);

    int updateRecord(ArCardRecordDto dto);

    int deleteByRecordNo(@Param("recordNo") Long recordNo);

    String findPersonIdByEmpId(@Param("empId") String empId);

    int countDuplicate(ArCardRecordDto dto);

    int insertFromDevice(ArCardRecordDto dto);
}
