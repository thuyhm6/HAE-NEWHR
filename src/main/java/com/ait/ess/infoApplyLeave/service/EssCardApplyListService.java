package com.ait.ess.infoApplyLeave.service;

import com.ait.ess.infoApplyLeave.dto.EssCardApplyListDto;

import java.util.List;

public interface EssCardApplyListService {
    List<EssCardApplyListDto> getMyList(EssCardApplyListDto dto);
    int cancelMyList(List<String> applyNos);
}
