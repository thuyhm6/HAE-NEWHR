package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsScheduleDto;
import com.ait.evs.manage.mapper.EvsScheduleMapper;
import com.ait.evs.manage.service.EvsScheduleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsScheduleServiceImpl implements EvsScheduleService {

    private static final Logger log = LoggerFactory.getLogger(EvsScheduleServiceImpl.class);

    @Autowired
    private EvsScheduleMapper mapper;

    @Override
    public List<EvsScheduleDto> getList(EvsScheduleDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách quy trình đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveBatch(List<EvsScheduleDto> list) {
        try {
            for (EvsScheduleDto dto : list) {
                if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                    String seq = mapper.getNextSeq();
                    dto.setSeq(seq);
                    mapper.insert(dto);
                    log.info("Thêm mới quy trình đánh giá: seq={}, name={}", seq, dto.getName());
                } else {
                    mapper.update(dto);
                    log.info("Cập nhật quy trình đánh giá: seq={}, name={}", dto.getSeq(), dto.getName());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu batch quy trình đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteBatch(List<String> seqs) {
        try {
            for (String seq : seqs) {
                mapper.deleteBySeq(seq);
                log.info("Xóa quy trình đánh giá: seq={}", seq);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa batch quy trình đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }
}
