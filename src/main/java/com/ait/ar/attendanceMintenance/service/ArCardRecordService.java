package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.Map;

public interface ArCardRecordService {

    DataTablesResponse<ArCardRecordDto> getPageList(ArCardRecordDto dto);

    ArCardRecordDto getByRecordNo(Long recordNo);

    Map<String, Object> insertRecord(ArCardRecordDto dto);

    Map<String, Object> updateRecord(ArCardRecordDto dto);

    Map<String, Object> deleteByRecordNo(Long recordNo);

    Map<String, Object> importFromDevice(String fromDate, String toDate);
}
