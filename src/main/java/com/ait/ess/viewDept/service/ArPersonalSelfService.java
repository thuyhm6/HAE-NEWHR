package com.ait.ess.viewDept.service;

import com.ait.ess.viewDept.dto.ArPersonalSelfDetailDto;
import com.ait.ess.viewDept.dto.ArPersonalSelfDto;

import java.util.List;

public interface ArPersonalSelfService {
    List<ArPersonalSelfDto> getSummaryList(ArPersonalSelfDto params);
    List<ArPersonalSelfDto> getItemList();
    List<ArPersonalSelfDetailDto> getDetailList(ArPersonalSelfDetailDto params);
}
