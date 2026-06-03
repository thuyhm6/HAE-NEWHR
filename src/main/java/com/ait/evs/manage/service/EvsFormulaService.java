package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsFormulaDto;

import java.util.List;

public interface EvsFormulaService {
    List<EvsFormulaDto> getList(EvsFormulaDto params);
    List<EvsFormulaDto> getFormulaOptions();
    EvsFormulaDto getOne(String seq);
    void save(EvsFormulaDto dto);
    void delete(String seq);
}
