package com.ait.pa.salary.service;

import com.ait.pa.salary.dto.PaInputItemParamDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

public interface PaInputItemParamService {

    DataTablesResponse<PaInputItemParamDto> getPagedList(PaInputItemParamDto params);

    PaInputItemParamDto getOne(String paramNo);

    void update(PaInputItemParamDto dto);

    void deleteList(List<String> paramNos);

    List<PaInputItemParamDto> getDistinctList();
}
