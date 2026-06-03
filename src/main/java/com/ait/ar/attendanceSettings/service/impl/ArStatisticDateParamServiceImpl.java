package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.mapper.ArStatisticDateParamMapper;
import com.ait.ar.attendanceSettings.model.ArStatisticDateParam;
import com.ait.ar.attendanceSettings.service.ArStatisticDateParamService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ArStatisticDateParamServiceImpl implements ArStatisticDateParamService {

    @Autowired
    private ArStatisticDateParamMapper paramMapper;

    @Override
    public List<ArStatisticDateParam> getCycleParams(String cpnyId, String statNo) {
        return paramMapper.selectCycleParams(cpnyId, statNo);
    }

    @Override
    public ArStatisticDateParam getCycleParamById(String paramNo) {
        return paramMapper.selectCycleParamById(paramNo);
    }

    @Override
    public void saveCycleParam(ArStatisticDateParam param) {
        if (param.getParamNo() == null || param.getParamNo().trim().isEmpty()) {
            // Thêm mới
            paramMapper.insertCycleParam(param);
        } else {
            // Cập nhật
            paramMapper.updateCycleParam(param);
        }
    }

    @Override
    public void deleteCycleParam(String paramNo) {
        paramMapper.deleteCycleParam(paramNo);
    }
}
