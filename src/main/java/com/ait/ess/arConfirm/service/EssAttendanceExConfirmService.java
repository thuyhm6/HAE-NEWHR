package com.ait.ess.arConfirm.service;

import com.ait.ess.arConfirm.dto.EssAttendanceExConfirmDto;
import com.ait.sy.sys.dto.DataTablesResponse;

public interface EssAttendanceExConfirmService {

    DataTablesResponse<EssAttendanceExConfirmDto> getPageList(EssAttendanceExConfirmDto dto);

    String confirmAttendanceEx(String applyNo, String flag, String hrComment);
}
