package com.ait.ar.countAttendance.service;

import com.ait.ar.countAttendance.dto.ArCountInfoListOtDto;

import java.util.List;

public interface ArCountInfoListService {
    /** Tổng hợp tăng ca theo tháng của nhân viên (tab "Tăng ca"). */
    List<ArCountInfoListOtDto> getOtSummaryList(ArCountInfoListOtDto params);
}
