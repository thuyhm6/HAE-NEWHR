package com.ait.ess.infoApplyAttendance.service;

import com.ait.ess.infoApplyAttendance.dto.EssCoordApplyAttendanceDto;
import com.ait.sy.sys.dto.DataTablesResponse;

public interface EssCoordApplyAttendanceService {

    DataTablesResponse<EssCoordApplyAttendanceDto> getPageList(EssCoordApplyAttendanceDto dto);
}
