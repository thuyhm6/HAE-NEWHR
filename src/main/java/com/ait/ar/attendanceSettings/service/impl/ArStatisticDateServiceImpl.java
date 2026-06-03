package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArStatisticDateDto;
import com.ait.ar.attendanceSettings.mapper.ArStatisticDateMapper;
import com.ait.ar.attendanceSettings.model.ArStatisticDate;
import com.ait.ar.attendanceSettings.service.ArStatisticDateService;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;
import com.ait.sy.sys.model.SyGlobalName;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ArStatisticDateServiceImpl implements ArStatisticDateService {

    @Autowired
    private ArStatisticDateMapper arStatisticDateMapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<ArStatisticDateDto> getCycleList(String statNo) {
        return arStatisticDateMapper.findAll(statNo);
    }

    @Override
    public ArStatisticDateDto getCycleById(String statNo) {
        ArStatisticDate entity = arStatisticDateMapper.selectByStatNo(statNo);
        if (entity == null) {
            return null;
        }

        ArStatisticDateDto dto = new ArStatisticDateDto();
        BeanUtils.copyProperties(entity, dto);

        // Lấy tên đa ngôn ngữ
        dto.setNameVi(syGlobalNameMapper.getContentByNoAndLanguage(statNo, "vi"));
        dto.setNameEn(syGlobalNameMapper.getContentByNoAndLanguage(statNo, "en"));
        dto.setNameZh(syGlobalNameMapper.getContentByNoAndLanguage(statNo, "zh"));
        dto.setNameKo(syGlobalNameMapper.getContentByNoAndLanguage(statNo, "ko"));

        return dto;
    }

    @Override
    public void saveCycle(ArStatisticDateDto dto) {
        String statNo = dto.getStatNo();
        boolean isNew = (statNo == null || statNo.trim().isEmpty());

        if (isNew) {
            statNo = syGlobalNameMapper.getNextNoSeq();
            dto.setStatNo(statNo);
        }

        ArStatisticDate entity = new ArStatisticDate();
        BeanUtils.copyProperties(dto, entity);

        if (isNew) {
            arStatisticDateMapper.insert(entity);
        } else {
            arStatisticDateMapper.update(entity);
        }

        // Lưu thông tin đa ngôn ngữ
        if (statNo != null) {
            saveGlobalName(statNo, "vi", dto.getNameVi());
            saveGlobalName(statNo, "en", dto.getNameEn());
            saveGlobalName(statNo, "zh", dto.getNameZh());
            saveGlobalName(statNo, "ko", dto.getNameKo());
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
            // existing.setUpdatedBy(user); // syGlobalName object does not use updatedBy
            // setter directly here, update mapper uses parameter maps or entity.
            // SyGlobalNameMapper handles this, usually with param map or we can set it.
            syGlobalNameMapper.update(existing); // Usually update statement in SyGlobalNameMapper uses adminID
                                                 // property, need to verify
        } else {
            SyGlobalName gn = new SyGlobalName();
            gn.setNo(no);
            gn.setLanguage(lang);
            gn.setContent(content);
            gn.setActivity("1");
            gn.setOrderNo(0);
            syGlobalNameMapper.insert(gn); // Same here, usually insert uses adminID
        }
    }

    @Override
    public void deleteCycle(String statNo) {
        // Xóa thông tin đa ngôn ngữ
        syGlobalNameMapper.deleteByNo(statNo);

        // Xóa thông tin chính
        arStatisticDateMapper.delete(statNo);
    }
}
