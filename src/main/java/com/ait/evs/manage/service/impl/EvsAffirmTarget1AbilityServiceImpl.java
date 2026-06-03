package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsAffirmTarget1AbilityDto;
import com.ait.evs.manage.dto.EvsItemAbilityDto;
import com.ait.evs.manage.mapper.EvsAffirmTarget1AbilityMapper;
import com.ait.evs.manage.service.EvsAffirmTarget1AbilityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsAffirmTarget1AbilityServiceImpl implements EvsAffirmTarget1AbilityService {

    private static final Logger log = LoggerFactory.getLogger(EvsAffirmTarget1AbilityServiceImpl.class);

    @Autowired
    private EvsAffirmTarget1AbilityMapper mapper;

    @Override
    public List<EvsItemAbilityDto> getItemList(EvsAffirmTarget1AbilityDto params) {
        try {
            return mapper.selectItemList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách năng lực lần 1: seq={}, {}", params.getSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveDetail(EvsAffirmTarget1AbilityDto dto) {
        try {
            List<EvsItemAbilityDto> items = dto.getItems();
            if (items != null && !items.isEmpty()) {
                for (EvsItemAbilityDto item : items) {
                    item.setEvsObjectSeq(dto.getSeq());
                    item.setResumeSeq(dto.getResumeSeq());
                    mapper.upsertItemScore1(item);
                    log.info("Upsert EVS_ITEM_SCORE lần 1: evsObjectSeq={}, itemSeq={}, score1={}",
                            dto.getSeq(), item.getItemSeq(), item.getEvsScore1());
                }
            }
            mapper.upsertAffirm1(dto);
            log.info("Upsert EVS_AFFIRM lần 1 (năng lực): seq={}", dto.getSeq());
        } catch (Exception e) {
            log.error("Lỗi khi lưu đánh giá năng lực lần 1: seq={}, {}", dto.getSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public void confirmDetail(EvsAffirmTarget1AbilityDto dto) {
        try {
            saveDetail(dto);
            dto.setFlag("1");
            mapper.callModifyObjectActivity(dto);
            log.info("PR_MODIFY_OBJECT_ACTIVITY (xác nhận năng lực lần 1): seq={}, message={}", dto.getSeq(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xác nhận đánh giá năng lực lần 1: seq={}, {}", dto.getSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public void rejectDetail(EvsAffirmTarget1AbilityDto dto) {
        try {
            dto.setFlag("0");
            mapper.callModifyObjectActivity(dto);
            log.info("PR_MODIFY_OBJECT_ACTIVITY (từ chối năng lực lần 1): seq={}, message={}", dto.getSeq(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi từ chối đánh giá năng lực lần 1: seq={}, {}", dto.getSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }
}
