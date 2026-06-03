package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArScheduleHtsvDto;
import com.ait.ar.attendanceMintenance.mapper.ArScheduleHtsvMapper;
import com.ait.ar.attendanceMintenance.model.ArScheduleHtsv;
import com.ait.ar.attendanceMintenance.service.ArScheduleHtsvService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ArScheduleHtsvServiceImpl implements ArScheduleHtsvService {

    @Autowired
    private ArScheduleHtsvMapper mapper;

    @Override
    public List<ArScheduleHtsvDto> getList(Map<String, Object> params) {
        return mapper.getList(params);
    }

    @Override
    public ArScheduleHtsvDto getByPkNo(Long pkNo) {
        return mapper.getByPkNo(pkNo);
    }

    @Override
    @Transactional
    public void save(ArScheduleHtsv model) {
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
