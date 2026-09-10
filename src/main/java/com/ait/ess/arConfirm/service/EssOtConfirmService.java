package com.ait.ess.arConfirm.service;

import com.ait.ess.arConfirm.dto.EssOtConfirmDto;
import com.ait.sy.sys.dto.DataTablesResponse;

public interface EssOtConfirmService {

    DataTablesResponse<EssOtConfirmDto> getPageList(EssOtConfirmDto dto);

    String confirmOt(String applyNo, String flag, String hrComment);
}
