package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeImportTempDto;
import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;

import java.util.List;
import java.util.Map;

public interface ArOvertimeManagentService {

    List<ArOvertimeManagentDto> getList(ArOvertimeManagentDto dto);

    Map<String, Object> getDetail(String applyNo, String applyType);

    ArOvertimeManagentDto getDefaultOtInfo(ArOvertimeManagentDto dto);

    ArOvertimeManagentDto getAutoFillOtInfo(ArOvertimeManagentDto dto);

    List<ArOvertimeImportTempDto> getImportTempList(String errorOnly);

    String importTempToOfficial();

    void save(ArOvertimeManagentDto dto);

    void saveBatch(List<ArOvertimeManagentDto> dtos);

    void cancelOvertimeApply(String applyNo);

    Map<String, Object> cancelBatchOvertimeApply(List<String> applyNos);

    void resubmitOvertimeApply(ArOvertimeManagentDto dto);

    ArOvertimeManagentDto getOtTotals(String personId, String applyOtDate);
}
