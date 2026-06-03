package com.ait.ar.attendanceSettings.service;

import com.ait.ar.attendanceSettings.dto.ArStaItemDto;
import java.util.List;

public interface ArStaItemService {
    List<ArStaItemDto> getItemList(String searchText);

    ArStaItemDto getItemById(String itemNo);

    void saveItem(ArStaItemDto dto);

    void deleteItem(String itemNo);
}
