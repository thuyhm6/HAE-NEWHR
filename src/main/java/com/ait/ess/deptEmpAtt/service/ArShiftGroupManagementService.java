package com.ait.ess.deptEmpAtt.service;

import com.ait.ess.deptEmpAtt.dto.ArShiftGroupManagementDto;

import java.util.List;
import java.util.Map;

public interface ArShiftGroupManagementService {

    List<ArShiftGroupManagementDto> getList(ArShiftGroupManagementDto dto);

    List<ArShiftGroupManagementDto> getListByPersonId(ArShiftGroupManagementDto dto);

    void saveChange(Map<String, Object> params);
}
