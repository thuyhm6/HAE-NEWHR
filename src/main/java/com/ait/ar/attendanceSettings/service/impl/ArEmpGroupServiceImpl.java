package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArEmpGroupDto;
import com.ait.ar.attendanceSettings.mapper.ArEmpGroupMapper;
import com.ait.ar.attendanceSettings.model.ArEmpGroup;
import com.ait.ar.attendanceSettings.service.ArEmpGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ArEmpGroupServiceImpl implements ArEmpGroupService {
    
    @Autowired
    private ArEmpGroupMapper mapper;

    @Override
    public List<ArEmpGroupDto> getList(Map<String, Object> params) {
        return mapper.getList(params);
    }

    @Override
    public ArEmpGroupDto getByPersonId(String personId, String groupNo) {
        return mapper.getByPersonId(personId, groupNo);
    }

    @Override
    @Transactional
    public void save(ArEmpGroup model) {
        // Luôn gán GROUP_NO = 80000084
        model.setGroupNo("80000084");
        
        ArEmpGroupDto existing = mapper.getByPersonId(model.getPersonId(), model.getGroupNo());
        if (existing != null) {
            mapper.update(model);
        } else {
            mapper.insert(model);
        }
    }

    @Override
    @Transactional
    public void delete(String personId, String groupNo) {
        mapper.delete(personId, groupNo);
    }
}
