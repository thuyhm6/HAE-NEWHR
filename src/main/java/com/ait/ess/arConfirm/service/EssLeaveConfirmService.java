package com.ait.ess.arConfirm.service;

import com.ait.ess.arConfirm.dto.EssLeaveConfirmDto;
import com.ait.sy.sys.dto.DataTablesResponse;

public interface EssLeaveConfirmService {

    DataTablesResponse<EssLeaveConfirmDto> getPageList(EssLeaveConfirmDto dto);

    String confirmLeave(String applyNo, String flag, String hrComment);
}
