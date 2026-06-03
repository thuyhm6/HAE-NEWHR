package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArItemParamDto;
import com.ait.ar.attendanceSettings.mapper.ArItemParamMapper;
import com.ait.ar.attendanceSettings.model.ArItemParam;
import com.ait.ar.attendanceSettings.service.ArItemParamService;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ArItemParamServiceImpl implements ArItemParamService {

    @Autowired
    private ArItemParamMapper arItemParamMapper;

    @Override
    public List<ArItemParamDto> getParamList(String itemNo) {
        return arItemParamMapper.findAll(itemNo);
    }

    @Override
    public ArItemParamDto getParamById(String arParamNo) {
        ArItemParam entity = arItemParamMapper.selectByParamNo(arParamNo);
        if (entity == null) {
            return null;
        }

        ArItemParamDto dto = new ArItemParamDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    @Override
    public void saveParam(ArItemParamDto dto) {
        String arParamNo = dto.getArParamNo();
        boolean isNew = (arParamNo == null || arParamNo.trim().isEmpty());

        if (isNew) {
            arParamNo = arItemParamMapper.getNextParamNoSeq();
            dto.setArParamNo(arParamNo);
        }

        ArItemParam entity = new ArItemParam();
        BeanUtils.copyProperties(dto, entity);

        if (isNew) {
            arItemParamMapper.insert(entity);
        } else {
            arItemParamMapper.update(entity);
        }
    }

    @Override
    public void deleteParam(String arParamNo) {
        arItemParamMapper.delete(arParamNo);
    }

    @Override
    public List<ArItemParamDto> getArItemOptions(String type) {
        String normalizedType = "overtime".equalsIgnoreCase(type) ? "overtime" : "attendance";
        return arItemParamMapper.selectArItemOptions(normalizedType);
    }
}
