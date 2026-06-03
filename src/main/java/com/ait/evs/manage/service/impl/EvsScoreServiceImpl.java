package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsScoreDto;
import com.ait.evs.manage.mapper.EvsScoreMapper;
import com.ait.evs.manage.service.EvsScoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsScoreServiceImpl implements EvsScoreService {

    private static final Logger log = LoggerFactory.getLogger(EvsScoreServiceImpl.class);

    @Autowired
    private EvsScoreMapper mapper;

    @Override
    public List<EvsScoreDto> getList(EvsScoreDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách tỷ lệ phân bổ: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public EvsScoreDto getOne(String seq) {
        try {
            return mapper.selectOne(seq);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết tỷ lệ phân bổ: seq={}, {}", seq, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void save(EvsScoreDto dto) {
        try {
            if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                dto.setSeq(mapper.getNextSeq());
                mapper.insert(dto);
                log.info("Thêm mới tỷ lệ phân bổ: seq={}, scoreType={}", dto.getSeq(), dto.getScoreType());
            } else {
                mapper.update(dto);
                log.info("Cập nhật tỷ lệ phân bổ: seq={}, scoreType={}", dto.getSeq(), dto.getScoreType());
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu tỷ lệ phân bổ: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void delete(String seq) {
        try {
            mapper.deleteBySeq(seq);
            log.info("Xóa tỷ lệ phân bổ: seq={}", seq);
        } catch (Exception e) {
            log.error("Lỗi khi xóa tỷ lệ phân bổ: seq={}, {}", seq, e.getMessage(), e);
            throw e;
        }
    }
}
