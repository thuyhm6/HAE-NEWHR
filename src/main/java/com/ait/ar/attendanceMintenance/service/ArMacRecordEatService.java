package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArMacRecordEatDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;
import java.util.Map;

public interface ArMacRecordEatService {

    DataTablesResponse<ArMacRecordEatDto> getPageList(ArMacRecordEatDto dto);

    List<ArMacRecordEatDto> getExportList(ArMacRecordEatDto dto);

    Map<String, Object> importFromDevice(String fromDate, String toDate);
}
