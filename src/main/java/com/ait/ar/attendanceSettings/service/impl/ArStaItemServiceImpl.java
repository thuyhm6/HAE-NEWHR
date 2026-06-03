package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArStaItemDto;
import com.ait.ar.attendanceSettings.mapper.ArStaItemMapper;
import com.ait.ar.attendanceSettings.model.ArStaItem;
import com.ait.ar.attendanceSettings.service.ArStaItemService;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;
import com.ait.sy.sys.model.SyGlobalName;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ArStaItemServiceImpl implements ArStaItemService {

    @Autowired
    private ArStaItemMapper arStaItemMapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<ArStaItemDto> getItemList(String searchText) {
        return arStaItemMapper.findAll(searchText);
    }

    @Override
    public ArStaItemDto getItemById(String itemNo) {
        ArStaItem entity = arStaItemMapper.selectByItemNo(itemNo);
        if (entity == null) {
            return null;
        }

        ArStaItemDto dto = new ArStaItemDto();
        BeanUtils.copyProperties(entity, dto);

        dto.setNameVi(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "vi"));
        dto.setNameEn(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "en"));
        dto.setNameZh(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "zh"));
        dto.setNameKo(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "ko"));

        return dto;
    }

    @Override
    public void saveItem(ArStaItemDto dto) {
        String itemNo = dto.getItemNo();
        boolean isNew = (itemNo == null || itemNo.trim().isEmpty());

        if (isNew) {
            // item_no is generated from sy_global_name sequence
            itemNo = syGlobalNameMapper.getNextNoSeq();
            dto.setItemNo(itemNo);
        }

        // As requested: DATATYPE always 1492
        dto.setDatatype("1492");

        ArStaItem entity = new ArStaItem();
        BeanUtils.copyProperties(dto, entity);

        if (isNew) {
            arStaItemMapper.insert(entity);
        } else {
            arStaItemMapper.update(entity);
        }

        if (itemNo != null) {
            saveGlobalName(itemNo, "vi", dto.getNameVi());
            saveGlobalName(itemNo, "en", dto.getNameEn());
            saveGlobalName(itemNo, "zh", dto.getNameZh());
            saveGlobalName(itemNo, "ko", dto.getNameKo());
        }
    }

    private void saveGlobalName(String no, String lang, String content) {
        if (content == null) {
            content = "";
        }
        SyGlobalName existing = syGlobalNameMapper.findByNoAndLanguage(no, lang);
        if (existing != null) {
            existing.setContent(content);
            if (!"1".equals(existing.getActivity())) {
                existing.setActivity("1");
            }
            syGlobalNameMapper.update(existing);
        } else {
            SyGlobalName gn = new SyGlobalName();
            gn.setNo(no);
            gn.setLanguage(lang);
            gn.setContent(content);
            gn.setActivity("1");
            gn.setOrderNo(0);
            syGlobalNameMapper.insert(gn);
        }
    }

    @Override
    public void deleteItem(String itemNo) {
        syGlobalNameMapper.deleteByNo(itemNo);
        arStaItemMapper.delete(itemNo);
    }
}
