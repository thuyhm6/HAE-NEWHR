package com.ait.ess.infoApply.service;

import com.ait.ess.infoApply.dto.EssOtApplyListDto;

import java.util.List;
import java.util.Map;

public interface EssOtApplyService {
    Map<String, Object> getOtDateInfo(String applyDate);
    Map<String, Object> getOtDuration(String applyOtDate, String otFromTime, String otToTime, String deductYn);
    List<EssOtApplyListDto> getMyOtApplyList(EssOtApplyListDto dto);
    int cancelMyOtApplyList(List<String> applyNos);
}
