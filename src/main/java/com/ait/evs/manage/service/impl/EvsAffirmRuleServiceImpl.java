package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsAffirmRuleDto;
import com.ait.evs.manage.mapper.EvsAffirmRuleMapper;
import com.ait.evs.manage.service.EvsAffirmRuleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsAffirmRuleServiceImpl implements EvsAffirmRuleService {

    private static final Logger log = LoggerFactory.getLogger(EvsAffirmRuleServiceImpl.class);

    @Autowired
    private EvsAffirmRuleMapper mapper;

    @Override
    public List<EvsAffirmRuleDto> getList(EvsAffirmRuleDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách người đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveBatch(List<EvsAffirmRuleDto> list) {
        try {
            for (EvsAffirmRuleDto dto : list) {
                if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                    dto.setSeq(mapper.getNextSeq());
                    mapper.insert(dto);
                    log.info("Thêm mới người đánh giá: seq={}", dto.getSeq());
                } else {
                    mapper.update(dto);
                    log.info("Cập nhật người đánh giá: seq={}", dto.getSeq());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu người đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteBatch(List<String> seqs) {
        try {
            for (String seq : seqs) {
                mapper.deleteBySeq(seq);
                log.info("Xóa người đánh giá: seq={}", seq);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa người đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }
}
