package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArItemDto;
import com.ait.ar.attendanceSettings.mapper.ArItemMapper;
import com.ait.ar.attendanceSettings.model.ArItem;
import com.ait.ar.attendanceSettings.service.ArItemService;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;
import com.ait.sy.sys.model.SyGlobalName;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ArItemServiceImpl implements ArItemService {

    @Autowired
    private ArItemMapper arItemMapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<ArItemDto> getItemList(String itemNo) {
        return arItemMapper.findAll(itemNo);
    }

    @Override
    public ArItemDto getItemById(String itemNo) {
        ArItem entity = arItemMapper.selectByItemNo(itemNo);
        if (entity == null) {
            return null;
        }

        ArItemDto dto = new ArItemDto();
        BeanUtils.copyProperties(entity, dto);

        // Lấy tên đa ngôn ngữ
        dto.setNameVi(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "vi"));
        dto.setNameEn(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "en"));
        dto.setNameZh(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "zh"));
        dto.setNameKo(syGlobalNameMapper.getContentByNoAndLanguage(itemNo, "ko"));

        return dto;
    }

    @Override
    public void saveItem(ArItemDto dto) {
        String itemNo = dto.getItemNo();
        boolean isNew = (itemNo == null || itemNo.trim().isEmpty());

        if (isNew) {
            itemNo = syGlobalNameMapper.getNextNoSeq();
            dto.setItemNo(itemNo);
        }

        ArItem entity = new ArItem();
        BeanUtils.copyProperties(dto, entity);

        if (isNew) {
            arItemMapper.insert(entity);
        } else {
            arItemMapper.update(entity);
        }

        // Lưu thông tin đa ngôn ngữ
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
        // Xóa thông tin đa ngôn ngữ
        syGlobalNameMapper.deleteByNo(itemNo);

        // Xóa thông tin chính
        arItemMapper.delete(itemNo);
    }
}
