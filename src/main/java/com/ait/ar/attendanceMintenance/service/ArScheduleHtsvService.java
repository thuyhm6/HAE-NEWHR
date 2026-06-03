package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArScheduleHtsvDto;
import com.ait.ar.attendanceMintenance.model.ArScheduleHtsv;
import java.util.List;
import java.util.Map;

public interface ArScheduleHtsvService {
    List<ArScheduleHtsvDto> getList(Map<String, Object> params);
    ArScheduleHtsvDto getByPkNo(Long pkNo);
    void save(ArScheduleHtsv model);
    void delete(Long pkNo);
}
