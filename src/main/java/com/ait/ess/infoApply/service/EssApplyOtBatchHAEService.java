package com.ait.ess.infoApply.service;

import com.ait.ess.infoApply.dto.EssApplyOtBatchHAEDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

public interface EssApplyOtBatchHAEService {

    DataTablesResponse<EssApplyOtBatchHAEDto> getPageList(EssApplyOtBatchHAEDto dto);

    List<EssApplyOtBatchHAEDto> getOtItemList();
}
