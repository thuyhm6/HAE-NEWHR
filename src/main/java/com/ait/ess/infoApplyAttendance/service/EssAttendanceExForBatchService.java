package com.ait.ess.infoApplyAttendance.service;

import com.ait.ess.infoApplyAttendance.dto.EssAttendanceExForBatchDto;

import java.util.List;
import java.util.Map;

public interface EssAttendanceExForBatchService {
    List<EssAttendanceExForBatchDto> getAttendanceExForBatchList(EssAttendanceExForBatchDto params);

    List<EssAttendanceExForBatchDto> getCheckAttendanceExForBatchList(EssAttendanceExForBatchDto params);

    Map<String, Object> getCardApplyDetail(String applyNo, String applyType);

    int applyAttendanceExForBatch(List<EssAttendanceExForBatchDto> selectedRows);
}
