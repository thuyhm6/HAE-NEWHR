package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsGradeDto;
import com.ait.evs.manage.mapper.EvsGradeMapper;
import com.ait.evs.manage.service.EvsGradeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsGradeServiceImpl implements EvsGradeService {

    private static final Logger log = LoggerFactory.getLogger(EvsGradeServiceImpl.class);

    @Autowired
    private EvsGradeMapper mapper;

    @Override
    public List<EvsGradeDto> getList(EvsGradeDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách cấp đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveBatch(List<EvsGradeDto> list) {
        try {
            for (EvsGradeDto dto : list) {
                if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                    dto.setSeq(mapper.getNextSeq());
                    mapper.insert(dto);
                    log.info("Thêm mới cấp đánh giá: seq={}", dto.getSeq());
                } else {
                    mapper.update(dto);
                    log.info("Cập nhật cấp đánh giá: seq={}", dto.getSeq());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu cấp đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteBatch(List<String> seqs) {
        try {
            for (String seq : seqs) {
                mapper.deleteBySeq(seq);
                log.info("Xóa cấp đánh giá: seq={}", seq);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa cấp đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }
}
