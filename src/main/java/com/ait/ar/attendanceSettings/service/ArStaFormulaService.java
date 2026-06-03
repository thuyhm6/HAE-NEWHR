package com.ait.ar.attendanceSettings.service;

import com.ait.ar.attendanceSettings.dto.ArStaFormulaDto;
import java.util.List;
import java.util.Map;

public interface ArStaFormulaService {
    List<Map<String, Object>> getLeftTreeItems();

    List<ArStaFormulaDto> getFormulasByItemNo(String itemNo);

    ArStaFormulaDto getFormulaById(Long formularNo);

    void saveFormula(ArStaFormulaDto dto);

    void deleteFormula(Long formularNo);

    // Tools for Formular Input
    List<Map<String, Object>> getAttItems();

    List<Map<String, Object>> getStaItems();

    List<Map<String, Object>> getBasicInfos();
}
