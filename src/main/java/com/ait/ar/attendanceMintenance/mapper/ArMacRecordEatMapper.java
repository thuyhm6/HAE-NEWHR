package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArMacRecordEatDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ArMacRecordEatMapper {

    int countList(ArMacRecordEatDto dto);

    List<ArMacRecordEatDto> selectListPage(ArMacRecordEatDto dto);

    List<ArMacRecordEatDto> selectListAll(ArMacRecordEatDto dto);

    int countDuplicateEat(ArMacRecordEatDto dto);

    int insertFromDevice(ArMacRecordEatDto dto);
}
