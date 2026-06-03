package com.ait.pa.workManagement.service;

import com.ait.pa.workManagement.dto.PaPayScheduleDto;

import java.util.List;

public interface PaPayScheduleService {

    List<PaPayScheduleDto> getList(PaPayScheduleDto params);

    List<PaPayScheduleDto> getOpenList();

    PaPayScheduleDto getOne(String payScheduleNo);

    void save(PaPayScheduleDto dto);

    void delete(String payScheduleNo);
}
