package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArStaFormulaDto;
import com.ait.ar.attendanceSettings.mapper.ArStaFormulaMapper;
import com.ait.ar.attendanceSettings.model.ArStaFormula;
import com.ait.ar.attendanceSettings.service.ArStaFormulaService;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ArStaFormulaServiceImpl implements ArStaFormulaService {

    @Autowired
    private ArStaFormulaMapper mapper;

    @Override
    public List<Map<String, Object>> getLeftTreeItems() {
        // cpnyId parameter will be automatically injected by
        // LanguageParameterInterceptor if passed as null here,
        // but since we query by Map without passing cpnyId as method arg to service, we
        // can pass null to Mapper.
        return mapper.getParamItemsForLeftTree(null);
    }

    @Override
    public List<ArStaFormulaDto> getFormulasByItemNo(String itemNo) {
        // null cpnyId -> Interceptor will inject from Request Context
        return mapper.findByItemNo(null, itemNo);
    }

    @Override
    public ArStaFormulaDto getFormulaById(Long formularNo) {
        ArStaFormula entity = mapper.selectByFormularNo(formularNo);
        if (entity == null) {
            return null;
        }
        ArStaFormulaDto dto = new ArStaFormulaDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    @Override
    public void saveFormula(ArStaFormulaDto dto) {
        Long formularNo = dto.getFormularNo();
        boolean isNew = (formularNo == null);

        if (isNew) {
            formularNo = mapper.getNextFormularNoSeq();
            dto.setFormularNo(formularNo);
        }

        ArStaFormula entity = new ArStaFormula();
        BeanUtils.copyProperties(dto, entity);

        if (isNew) {
            // let Interceptor inject cpnyId during insert
            mapper.insert(entity);
        } else {
            mapper.update(entity);
        }
    }

    @Override
    public void deleteFormula(Long formularNo) {
        mapper.delete(formularNo);
    }

    @Override
    public List<Map<String, Object>> getAttItems() {
        return mapper.getAttItems();
    }

    @Override
    public List<Map<String, Object>> getStaItems() {
        return mapper.getStaItems();
    }

    @Override
    public List<Map<String, Object>> getBasicInfos() {
        return mapper.getBasicInfos();
    }
}
