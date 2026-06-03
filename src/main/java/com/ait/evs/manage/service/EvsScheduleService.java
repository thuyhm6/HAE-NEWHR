package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsScheduleDto;

import java.util.List;

public interface EvsScheduleService {
    List<EvsScheduleDto> getList(EvsScheduleDto params);
    void saveBatch(List<EvsScheduleDto> list);
    void deleteBatch(List<String> seqs);
}
