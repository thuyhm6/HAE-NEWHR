package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordDayDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

public interface ArCardRecordDayService {

    DataTablesResponse<ArCardRecordDayDto> getPageList(ArCardRecordDayDto dto);

    List<ArCardRecordDayDto> getExportList(ArCardRecordDayDto dto);
}
