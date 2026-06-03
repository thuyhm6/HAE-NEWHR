package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordForSelfDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;
import java.util.Map;

public interface ArCardRecordForSelfService {

    DataTablesResponse<ArCardRecordForSelfDto> getPageList(ArCardRecordForSelfDto dto);

    List<ArCardRecordForSelfDto> getExportList(ArCardRecordForSelfDto dto);

    Map<String, Object> importFromDevice(String fromDate, String toDate);
}
