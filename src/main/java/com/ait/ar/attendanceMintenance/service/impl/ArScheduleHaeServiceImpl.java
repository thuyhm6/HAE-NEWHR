package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArScheduleHaeDto;
import com.ait.ar.attendanceMintenance.mapper.ArScheduleHaeMapper;
import com.ait.ar.attendanceMintenance.model.ArScheduleHae;
import com.ait.ar.attendanceMintenance.service.ArScheduleHaeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ArScheduleHaeServiceImpl implements ArScheduleHaeService {

    @Autowired
    private ArScheduleHaeMapper mapper;

    @Override
    public List<ArScheduleHaeDto> getList(Map<String, Object> params) {
        return mapper.getList(params);
    }

    @Override
    public ArScheduleHaeDto getByPkNo(Long pkNo) {
        return mapper.getByPkNo(pkNo);
    }

    @Override
    @Transactional
    public void save(ArScheduleHae model) {
        if (model.getPkNo() != null) {
            mapper.update(model);
        } else {
            mapper.insert(model);
        }
    }

    @Override
    @Transactional
    public void delete(Long pkNo) {
        mapper.delete(pkNo);
    }
}
