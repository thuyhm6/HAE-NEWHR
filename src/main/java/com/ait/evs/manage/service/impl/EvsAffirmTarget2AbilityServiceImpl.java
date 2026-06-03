package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsAffirmTarget2AbilityDto;
import com.ait.evs.manage.dto.EvsItemAbilityDto;
import com.ait.evs.manage.mapper.EvsAffirmTarget2AbilityMapper;
import com.ait.evs.manage.service.EvsAffirmTarget2AbilityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsAffirmTarget2AbilityServiceImpl implements EvsAffirmTarget2AbilityService {

    private static final Logger log = LoggerFactory.getLogger(EvsAffirmTarget2AbilityServiceImpl.class);

    @Autowired
    private EvsAffirmTarget2AbilityMapper mapper;

    @Override
    public List<EvsItemAbilityDto> getItemList(EvsAffirmTarget2AbilityDto params) {
        try {
            return mapper.selectItemList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách năng lực lần 2: seq={}, {}", params.getSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveDetail(EvsAffirmTarget2AbilityDto dto) {
        try {
            List<EvsItemAbilityDto> items = dto.getItems();
            if (items != null && !items.isEmpty()) {
                for (EvsItemAbilityDto item : items) {
                    item.setEvsObjectSeq(dto.getSeq());
                    item.setResumeSeq(dto.getResumeSeq());
                    mapper.upsertItemScore2(item);
                    log.info("Upsert EVS_ITEM_SCORE lần 2: evsObjectSeq={}, itemSeq={}, score2={}",
                            dto.getSeq(), item.getItemSeq(), item.getEvsScore2());
                }
            }
            mapper.upsertAffirm2(dto);
            log.info("Upsert EVS_AFFIRM lần 2 (năng lực): seq={}", dto.getSeq());
        } catch (Exception e) {
            log.error("Lỗi khi lưu đánh giá năng lực lần 2: seq={}, {}", dto.getSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public void confirmDetail(EvsAffirmTarget2AbilityDto dto) {
        try {
            saveDetail(dto);
            dto.setFlag("1");
            mapper.callModifyObjectActivity(dto);
            log.info("PR_MODIFY_OBJECT_ACTIVITY (xác nhận năng lực lần 2): seq={}, message={}", dto.getSeq(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xác nhận đánh giá năng lực lần 2: seq={}, {}", dto.getSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public void rejectDetail(EvsAffirmTarget2AbilityDto dto) {
        try {
            dto.setFlag("0");
            mapper.callModifyObjectActivity(dto);
            log.info("PR_MODIFY_OBJECT_ACTIVITY (từ chối năng lực lần 2): seq={}, message={}", dto.getSeq(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi từ chối đánh giá năng lực lần 2: seq={}, {}", dto.getSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }
}
