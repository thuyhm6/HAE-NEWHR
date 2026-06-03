package com.ait.ess.viewDept.service;

import com.ait.ess.viewDept.dto.OtApplyPersonalSelfDetailDto;
import com.ait.ess.viewDept.dto.OtApplyPersonalSelfDto;

import java.util.List;

public interface OtApplyPersonalSelfService {
    List<OtApplyPersonalSelfDto> getSummaryList(OtApplyPersonalSelfDto params);
    List<OtApplyPersonalSelfDto> getItemList();
    List<OtApplyPersonalSelfDetailDto> getDetailList(OtApplyPersonalSelfDetailDto params);
}
