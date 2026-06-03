package com.ait.ess.viewDept.service;

import com.ait.ess.viewDept.dto.EssEntryInfoListDto;
import com.ait.sy.sys.dto.DataTablesResponse;

public interface EssEntryInfoListService {

    DataTablesResponse<EssEntryInfoListDto> getPageList(EssEntryInfoListDto dto);
}
