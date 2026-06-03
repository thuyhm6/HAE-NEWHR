package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsScoreDto;

import java.util.List;

public interface EvsScoreService {
    List<EvsScoreDto> getList(EvsScoreDto params);
    EvsScoreDto getOne(String seq);
    void save(EvsScoreDto dto);
    void delete(String seq);
}
