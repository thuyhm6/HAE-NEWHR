package com.ait.ar.attendanceSettings.service;

import com.ait.ar.attendanceSettings.dto.ArStaItemParamDto;
import java.util.List;
import java.util.Map;

public interface ArStaItemParamService {
    List<ArStaItemParamDto> getItemList(String searchText);

    ArStaItemParamDto getItemById(String paramNo);

    void saveItem(ArStaItemParamDto dto);

    void deleteItem(String paramNo);

    List<Map<String, Object>> getAvailableItems();
}
