package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordForSelfDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ArCardRecordForSelfMapper {

    int countList(ArCardRecordForSelfDto dto);

    List<ArCardRecordForSelfDto> selectListPage(ArCardRecordForSelfDto dto);

    List<ArCardRecordForSelfDto> selectListAll(ArCardRecordForSelfDto dto);

    int countDuplicate(ArCardRecordForSelfDto dto);

    int insertFromDevice(ArCardRecordForSelfDto dto);

    String findPersonIdByEmpId(@Param("empId") String empId);
}
