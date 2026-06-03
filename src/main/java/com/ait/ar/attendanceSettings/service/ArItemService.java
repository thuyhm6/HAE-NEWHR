package com.ait.ar.attendanceSettings.service;

import java.util.List;

import com.ait.ar.attendanceSettings.dto.ArItemDto;

public interface ArItemService {
    List<ArItemDto> getItemList(String itemNo);

    ArItemDto getItemById(String itemNo);

    void saveItem(ArItemDto dto);

    void deleteItem(String itemNo);
}
