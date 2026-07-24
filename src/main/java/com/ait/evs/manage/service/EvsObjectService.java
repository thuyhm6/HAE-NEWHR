package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsObjectDto;

import java.util.List;

public interface EvsObjectService {

    /**
     * Lấy danh sách thông tin đánh giá theo personId
     */
    List<EvsObjectDto> getByPersonId(String personId);
}
