package com.ait.pa.salary.service;

import com.ait.pa.salary.dto.PaItemInputDto;
import com.ait.pa.salary.dto.PaItemInputSaveReqDto;
import com.ait.pa.salary.dto.PaResultExportReqDto;

import java.util.List;
import java.util.Map;

public interface PaItemInputService {

    Map<String, List<PaItemInputDto>> getAllSectionItems();

    List<PaItemInputDto> getSavedItems(Integer isUse, Integer itemType);

    void saveItems(PaItemInputSaveReqDto req);

    byte[] exportSummaryHae(PaResultExportReqDto req);
}
