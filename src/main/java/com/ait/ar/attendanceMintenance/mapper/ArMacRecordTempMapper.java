package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArMacRecordTempDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ArMacRecordTempMapper {

    int deleteTempByUploader();

    int insertTemp(ArMacRecordTempDto dto);

    List<ArMacRecordTempDto> selectList(ArMacRecordTempDto dto);

    List<ArMacRecordTempDto> selectAllForConfirm();

    String findPersonIdByEmpId(@Param("empId") String empId);

    int countDuplicateInHtsv(@Param("cardNo") String cardNo,
                             @Param("combinedDatetime") String combinedDatetime,
                             @Param("doorType") String doorType);

    int insertIntoHtsv(ArMacRecordTempDto dto);
}
