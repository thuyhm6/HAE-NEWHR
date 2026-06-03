package com.ait.ess.infoApply.service;

import com.ait.ess.infoApply.dto.EssCoordApplyOtInfoDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

public interface EssCoordApplyOtInfoService {

    DataTablesResponse<EssCoordApplyOtInfoDto> getPageList(EssCoordApplyOtInfoDto dto);

    List<EssCoordApplyOtInfoDto> getOtItemList();
}
