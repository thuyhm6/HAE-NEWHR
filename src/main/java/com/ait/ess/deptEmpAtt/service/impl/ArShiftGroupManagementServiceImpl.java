package com.ait.ess.deptEmpAtt.service.impl;

import com.ait.ess.deptEmpAtt.dto.ArShiftGroupManagementDto;
import com.ait.ess.deptEmpAtt.mapper.ArShiftGroupManagementMapper;
import com.ait.ess.deptEmpAtt.service.ArShiftGroupManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ArShiftGroupManagementServiceImpl implements ArShiftGroupManagementService {

    @Autowired
    private ArShiftGroupManagementMapper mapper;

    @Override
    public List<ArShiftGroupManagementDto> getList(ArShiftGroupManagementDto dto) {
        return mapper.selectList(dto);
    }

    @Override
    public List<ArShiftGroupManagementDto> getListByPersonId(ArShiftGroupManagementDto dto) {
        return mapper.selectByPersonId(dto);
    }

    @Override
    public void saveChange(Map<String, Object> params) {
        mapper.callChangeProcedure(params);
    }
}
