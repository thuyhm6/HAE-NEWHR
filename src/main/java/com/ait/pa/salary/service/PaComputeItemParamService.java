package com.ait.pa.salary.service;

import com.ait.pa.salary.dto.PaComputeItemParamDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

public interface PaComputeItemParamService {

    DataTablesResponse<PaComputeItemParamDto> getPagedList(PaComputeItemParamDto params);

    PaComputeItemParamDto getOne(String paramNo);

    void insert(PaComputeItemParamDto dto);

    void update(PaComputeItemParamDto dto);

    void deleteList(List<String> paramNos);

    List<PaComputeItemParamDto> getItemList();

    List<PaComputeItemParamDto> getApplyTypeList();

    void swapOrder(String paramNo, String direction);
}
