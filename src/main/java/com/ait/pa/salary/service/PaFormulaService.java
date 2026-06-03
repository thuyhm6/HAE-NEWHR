package com.ait.pa.salary.service;

import com.ait.pa.salary.dto.PaFormulaDto;
import com.ait.pa.salary.dto.PaFormulaToolItemDto;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;
import java.util.Map;

public interface PaFormulaService {

    List<PaFormulaDto> getItemList();

    Map<String, List<PaFormulaToolItemDto>> getToolItems();

    List<PaFormulaToolItemDto> getAllItemNames();

    DataTablesResponse<PaFormulaDto> getPagedFormularList(PaFormulaDto params);

    PaFormulaDto getOneFormular(Long formularNo);

    void insertFormular(PaFormulaDto dto);

    void updateFormular(PaFormulaDto dto);

    void deleteFormular(Long formularNo);

    void swapConditionSeq(Long formularNo, String itemNo, String direction);
}
