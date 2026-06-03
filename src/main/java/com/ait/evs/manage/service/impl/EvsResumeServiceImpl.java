package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsResumeDto;
import com.ait.evs.manage.mapper.EvsResumeMapper;
import com.ait.evs.manage.service.EvsResumeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EvsResumeServiceImpl implements EvsResumeService {

    private static final Logger log = LoggerFactory.getLogger(EvsResumeServiceImpl.class);

    @Autowired
    private EvsResumeMapper mapper;

    @Override
    public List<EvsResumeDto> getList(EvsResumeDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public EvsResumeDto getOne(String seq) {
        try {
            return mapper.selectOne(seq);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết đánh giá {}: {}", seq, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void save(EvsResumeDto dto) {
        try {
            if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                String seq = mapper.getNextSeq();
                dto.setSeq(seq);
                mapper.insert(dto);
                log.info("Thêm mới đánh giá: seq={}", seq);
            } else {
                mapper.update(dto);
                log.info("Cập nhật đánh giá: seq={}", dto.getSeq());
            }
            if (dto.getCopyObject() != null && !dto.getCopyObject().isEmpty()) {
                Map<String, Object> procParams = new HashMap<>();
                procParams.put("seq", dto.getSeq());
                mapper.callInitEvsParam(procParams);
                String message = (String) procParams.get("message");
                log.info("PR_INIT_EVS_PARAM seq={} message={}", dto.getSeq(), message);
                if (message != null && !message.isEmpty() && !message.equalsIgnoreCase("OK")) {
                    throw new RuntimeException(message);
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void delete(String seq) {
        try {
            mapper.delete(seq);
            log.info("Xóa đánh giá: seq={}", seq);
        } catch (Exception e) {
            log.error("Lỗi khi xóa đánh giá {}: {}", seq, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<EvsResumeDto> getEvsResumeList(EvsResumeDto params) {
        try {
            return mapper.selectEvsResumeList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }
}
