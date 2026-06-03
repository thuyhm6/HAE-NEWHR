package com.ait.ar.attendanceSettings.service;

import com.ait.ar.attendanceSettings.dto.ArEmpGroupDto;
import com.ait.ar.attendanceSettings.model.ArEmpGroup;
import java.util.List;
import java.util.Map;

public interface ArEmpGroupService {
    List<ArEmpGroupDto> getList(Map<String, Object> params);
    ArEmpGroupDto getByPersonId(String personId, String groupNo);
    void save(ArEmpGroup model);
    void delete(String personId, String groupNo);
}
