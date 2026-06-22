package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArScheduleHaeDto;
import com.ait.ar.attendanceMintenance.model.ArScheduleHae;
import java.util.List;
import java.util.Map;

public interface ArScheduleHaeService {
    List<ArScheduleHaeDto> getList(Map<String, Object> params);
    ArScheduleHaeDto getByPkNo(Long pkNo);
    void save(ArScheduleHae model);
    void delete(Long pkNo);
}
