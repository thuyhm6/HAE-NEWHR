package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArShift010Dto;
import com.ait.ar.attendanceSettings.dto.ArShift020Dto;
import com.ait.ar.attendanceSettings.mapper.ArShift010Mapper;
import com.ait.ar.attendanceSettings.mapper.ArShift020Mapper;
import com.ait.ar.attendanceSettings.model.ArShift010;
import com.ait.ar.attendanceSettings.model.ArShift020;
import com.ait.ar.attendanceSettings.service.ArShiftService;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;
import com.ait.sy.sys.model.SyGlobalName;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ArShiftServiceImpl implements ArShiftService {
    private static final Logger log = LoggerFactory.getLogger(ArShiftServiceImpl.class);

    @Autowired
    private ArShift010Mapper arShift010Mapper;

    @Autowired
    private ArShift020Mapper arShift020Mapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<ArShift010Dto> getShiftList(String cpnyId, String searchText) {
        return arShift010Mapper.findAll(cpnyId, searchText);
    }

    @Override
    public ArShift010Dto getShiftById(String shiftNo) {
        ArShift010 entity = arShift010Mapper.selectByShiftNo(shiftNo);
        if (entity == null) {
            return null;
        }
        ArShift010Dto dto = new ArShift010Dto();
        BeanUtils.copyProperties(entity, dto);

        // Load global names
        List<SyGlobalName> names = syGlobalNameMapper.findByNo(shiftNo);
        for (SyGlobalName name : names) {
            if ("vi".equals(name.getLanguage()))
                dto.setNameVi(name.getContent());
            if ("en".equals(name.getLanguage()))
                dto.setNameEn(name.getContent());
            if ("zh".equals(name.getLanguage()))
                dto.setNameZh(name.getContent());
            if ("ko".equals(name.getLanguage()))
                dto.setNameKo(name.getContent());
        }
        return dto;
    }

    @Override
    public void saveShift(ArShift010Dto dto) {
        String shiftNo = dto.getShiftNo();
        boolean isNew = (shiftNo == null || shiftNo.trim().isEmpty());

        if (isNew) {
            shiftNo = syGlobalNameMapper.getNextNoSeq(); // Lấy ID tự động
            dto.setShiftNo(shiftNo);
        }

        ArShift010 entity = new ArShift010();
        BeanUtils.copyProperties(dto, entity);

        if (isNew) {
            arShift010Mapper.insert(entity);
        } else {
            arShift010Mapper.update(entity);
            syGlobalNameMapper.deleteByNo(shiftNo); // delete old names, insert new
        }

        // Save 4 languages
        saveLanguage(shiftNo, "vi", dto.getNameVi(), dto.getAdminID());
        saveLanguage(shiftNo, "en", dto.getNameEn(), dto.getAdminID());
        saveLanguage(shiftNo, "zh", dto.getNameZh(), dto.getAdminID());
        saveLanguage(shiftNo, "ko", dto.getNameKo(), dto.getAdminID());
    }

    private void saveLanguage(String no, String language, String content, String adminID) {
        if (content == null || content.trim().isEmpty())
            return;
        SyGlobalName name = new SyGlobalName();
        name.setNo(no);
        name.setLanguage(language);
        name.setContent(content);
        name.setCreatedBy(adminID);
        name.setOrderNo(0);
        syGlobalNameMapper.insert(name);
    }

    @Override
    public void deleteShift(String shiftNo) {
        arShift010Mapper.delete(shiftNo);
        syGlobalNameMapper.deleteByNo(shiftNo);

        // Cần xóa cả chi tiết AR_SHIFT020
        List<ArShift020Dto> details = arShift020Mapper.findByShiftNo(shiftNo);
        for (ArShift020Dto detail : details) {
            arShift020Mapper.delete(detail.getPkNo());
        }
    }

    // --- SHIFT 020 ---

    @Override
    public List<ArShift020Dto> getShiftDetailList(String shiftNo) {
        return arShift020Mapper.findByShiftNo(shiftNo);
    }

    @Override
    public ArShift020Dto getShiftDetailById(Long pkNo) {
        ArShift020 entity = arShift020Mapper.selectByPkNo(pkNo);
        if (entity == null) {
            return null;
        }

        ArShift020Dto dto = new ArShift020Dto();
        BeanUtils.copyProperties(entity, dto);

        if (entity.getFromTime() != null)
            dto.setFromTimeStr(entity.getFromTime().toString());
        if (entity.getToTime() != null)
            dto.setToTimeStr(entity.getToTime().toString());

        return dto;
    }

    @Override
    public void saveShiftDetail(ArShift020Dto dto) {
        boolean isNew = (dto.getPkNo() == null || dto.getPkNo() == 0);

        if (isNew) {
            dto.setPkNo(arShift020Mapper.getNextPkNoSeq());
        }

        ArShift020 entity = new ArShift020();
        BeanUtils.copyProperties(dto, entity);

        // Parse "HH:mm" to LocalTime
        try {
            if (dto.getFromTimeStr() != null && !dto.getFromTimeStr().trim().isEmpty())
                entity.setFromTime(LocalDateTime.parse(dto.getFromTimeStr()));
            if (dto.getToTimeStr() != null && !dto.getToTimeStr().trim().isEmpty())
                entity.setToTime(LocalDateTime.parse(dto.getToTimeStr()));
        } catch (Exception e) {
            log.error("Invalid shift detail time format for shiftNo={}", dto.getShiftNo(), e);
        }

        if (isNew) {
            arShift020Mapper.insert(entity);
        } else {
            arShift020Mapper.update(entity);
        }
    }

    @Override
    public void deleteShiftDetail(Long pkNo) {
        arShift020Mapper.delete(pkNo);
    }
}
