package com.ait.ess.viewDept.service.impl;

import com.ait.ess.viewDept.dto.ManageEvsResultEmpDto;
import com.ait.ess.viewDept.mapper.ManageEvsResultEmpMapper;
import com.ait.ess.viewDept.service.ManageEvsResultEmpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ManageEvsResultEmpServiceImpl implements ManageEvsResultEmpService {

    @Autowired
    private ManageEvsResultEmpMapper mapper;

    @Override
    public List<ManageEvsResultEmpDto> getList(ManageEvsResultEmpDto params) {
        return mapper.selectManageEvsResultEmpList(params);
    }
}
