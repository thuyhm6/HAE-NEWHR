package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeImportTempDto;
import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;

import java.util.List;
import java.util.Map;

public interface ArOvertimeManagentService {

    List<ArOvertimeManagentDto> getList(ArOvertimeManagentDto dto);

    List<ArOvertimeManagentDto> getListOver(ArOvertimeManagentDto dto);

    Map<String, Object> getDetail(String applyNo, String applyType);

    Map<String, Object> getDetailOver(String applyNo, String applyType);

    ArOvertimeManagentDto getDefaultOtInfo(ArOvertimeManagentDto dto);

    ArOvertimeManagentDto getAutoFillOtInfo(ArOvertimeManagentDto dto);

    List<ArOvertimeImportTempDto> getImportTempList(String errorOnly);

    String importTempToOfficial();

    void save(ArOvertimeManagentDto dto);

    void saveOver(ArOvertimeManagentDto dto);

    void saveBatch(List<ArOvertimeManagentDto> dtos);

    void saveBatchOver(List<ArOvertimeManagentDto> dtos);

    void cancelOvertimeApply(String applyNo);

    void cancelOvertimeApplyOver(String applyNo);

    Map<String, Object> cancelBatchOvertimeApply(List<String> applyNos);

    Map<String, Object> cancelBatchOvertimeApplyOver(List<String> applyNos);

    void resubmitOvertimeApply(ArOvertimeManagentDto dto);

    void resubmitOvertimeApplyOver(ArOvertimeManagentDto dto);

    ArOvertimeManagentDto getOtTotals(String personId, String applyOtDate);
}
