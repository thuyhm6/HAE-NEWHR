package com.ait.pa.salary.service;

import com.ait.pa.salary.dto.PaItemInputDto;
import com.ait.pa.salary.dto.PaItemInputSaveReqDto;

import java.util.List;
import java.util.Map;

public interface PaItemInputService {

    Map<String, List<PaItemInputDto>> getAllSectionItems();

    List<PaItemInputDto> getSavedItems(Integer isUse, Integer itemType);

    void saveItems(PaItemInputSaveReqDto req);

    byte[] exportSummaryHtsv(String payScheduleNo, List<String> deptNos, List<String> itemIds);
}
