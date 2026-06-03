package com.ait.ess.infoApply.service;

import com.ait.ess.infoApply.dto.EssPersonOtInfoDto;

import java.util.List;

public interface EssPersonOtInfoService {
    List<EssPersonOtInfoDto> getPersonOtList(EssPersonOtInfoDto dto);
    List<EssPersonOtInfoDto> getOtItemList();
}
