package com.ait.ess.viewDept.service.impl;

import com.ait.ess.viewDept.dto.ManageEmpPositionInfoDto;
import com.ait.ess.viewDept.dto.ManageEmpPositionInsideDto;
import com.ait.ess.viewDept.mapper.ManageEmpPositionInfoMapper;
import com.ait.ess.viewDept.service.ManageEmpPositionInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ManageEmpPositionInfoServiceImpl implements ManageEmpPositionInfoService {

    @Autowired
    private ManageEmpPositionInfoMapper mapper;

    @Override
    public List<ManageEmpPositionInfoDto> getList(ManageEmpPositionInfoDto params) {
        return mapper.selectManageEmpPositionInfoList(params);
    }

    @Override
    public List<ManageEmpPositionInsideDto> getInsideExperienceList(String personId) {
        return mapper.selectInsideExperienceList(personId);
    }
}
