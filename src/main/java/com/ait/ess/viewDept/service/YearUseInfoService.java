package com.ait.ess.viewDept.service;

import com.ait.ess.viewDept.dto.YearUseLeaveUsageDto;
import com.ait.ess.viewDept.dto.YearUseVacationDto;

import java.util.List;

public interface YearUseInfoService {
    List<YearUseVacationDto> getVacationRows(String year);
    List<YearUseLeaveUsageDto> getLeaveUsageList(String year);
}
