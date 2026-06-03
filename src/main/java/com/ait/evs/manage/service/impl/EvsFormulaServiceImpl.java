package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsFormulaDto;
import com.ait.evs.manage.mapper.EvsFormulaMapper;
import com.ait.evs.manage.service.EvsFormulaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsFormulaServiceImpl implements EvsFormulaService {

    private static final Logger log = LoggerFactory.getLogger(EvsFormulaServiceImpl.class);

    @Autowired
    private EvsFormulaMapper mapper;

    @Override
    public List<EvsFormulaDto> getList(EvsFormulaDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách công thức đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<EvsFormulaDto> getFormulaOptions() {
        try {
            return mapper.selectFormulaOptions(new EvsFormulaDto());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách options công thức: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public EvsFormulaDto getOne(String seq) {
        try {
            return mapper.selectOne(seq);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết công thức đánh giá: seq={}, {}", seq, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void save(EvsFormulaDto dto) {
        try {
            if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                dto.setSeq(mapper.getNextSeq());
                mapper.insert(dto);
                log.info("Thêm mới công thức đánh giá: seq={}, codeNo={}", dto.getSeq(), dto.getCodeNo());
            } else {
                mapper.update(dto);
                log.info("Cập nhật công thức đánh giá: seq={}, codeNo={}", dto.getSeq(), dto.getCodeNo());
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu công thức đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void delete(String seq) {
        try {
            mapper.deleteBySeq(seq);
            log.info("Xóa công thức đánh giá: seq={}", seq);
        } catch (Exception e) {
            log.error("Lỗi khi xóa công thức đánh giá: seq={}, {}", seq, e.getMessage(), e);
            throw e;
        }
    }
}
