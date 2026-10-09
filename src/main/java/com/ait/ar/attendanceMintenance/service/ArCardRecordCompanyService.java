package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordCompanyDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;
import java.util.Map;

public interface ArCardRecordCompanyService {

    DataTablesResponse<ArCardRecordCompanyDto> getPageList(ArCardRecordCompanyDto dto);

    List<ArCardRecordCompanyDto> getExportList(ArCardRecordCompanyDto dto);

    /** Đọc dữ liệu quẹt thẻ ra/vào cổng công ty từ máy chủ Access Control (WACS). */
    Map<String, Object> importFromDevice(String fromDate, String toDate);
}
