package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArStaItemParamDto;
import com.ait.ar.attendanceSettings.mapper.ArStaItemParamMapper;
import com.ait.ar.attendanceSettings.model.ArStaItemParam;
import com.ait.ar.attendanceSettings.service.ArStaItemParamService;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ArStaItemParamServiceImpl implements ArStaItemParamService {

    @Autowired
    private ArStaItemParamMapper mapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<ArStaItemParamDto> getItemList(String searchText) {
        return mapper.findAll(searchText);
    }

    @Override
    public ArStaItemParamDto getItemById(String paramNo) {
        ArStaItemParam entity = mapper.selectByParamNo(paramNo);
        if (entity == null) {
            return null;
        }

        ArStaItemParamDto dto = new ArStaItemParamDto();
        BeanUtils.copyProperties(entity, dto);

        String itemNo = entity.getItemNo();
        if (itemNo != null) {
            dto.setItemNameVi(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "vi"));
            dto.setItemNameEn(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "en"));
            dto.setItemNameZh(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "zh"));
            dto.setItemNameKo(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "ko"));
        }

        return dto;
    }

    @Override
    public void saveItem(ArStaItemParamDto dto) {
        String paramNo = dto.getParamNo();
        boolean isNew = (paramNo == null || paramNo.trim().isEmpty());

        if (isNew) {
            paramNo = mapper.getNextParamNoSeq();
            dto.setParamNo(paramNo);

            // Generate max CAL_ORDER + 1
            Integer maxCalOrder = mapper.getMaxCalOrder();
            dto.setCalOrder((maxCalOrder != null ? maxCalOrder : 0) + 1);
        }

        ArStaItemParam entity = new ArStaItemParam();
        BeanUtils.copyProperties(dto, entity);

        if (isNew) {
            mapper.insert(entity);
        } else {
            mapper.update(entity);
        }
    }

    @Override
    public void deleteItem(String paramNo) {
        mapper.delete(paramNo);
    }

    @Override
    public List<Map<String, Object>> getAvailableItems() {
        return mapper.getAvailableItems();
    }
}
