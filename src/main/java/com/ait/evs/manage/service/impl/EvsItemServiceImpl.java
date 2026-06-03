package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsItemDto;
import com.ait.evs.manage.mapper.EvsItemMapper;
import com.ait.evs.manage.service.EvsItemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsItemServiceImpl implements EvsItemService {

    private static final Logger log = LoggerFactory.getLogger(EvsItemServiceImpl.class);

    @Autowired
    private EvsItemMapper mapper;

    @Override
    public List<EvsItemDto> getList(EvsItemDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách chỉ tiêu đánh giá: resumeSeq={}, {}", params.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveBatch(List<EvsItemDto> list) {
        try {
            for (EvsItemDto dto : list) {
                if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                    dto.setSeq(mapper.getNextSeq());
                    mapper.insert(dto);
                    log.info("Thêm mới chỉ tiêu đánh giá: seq={}, itemCode={}", dto.getSeq(), dto.getItemCode());
                } else {
                    mapper.update(dto);
                    log.info("Cập nhật chỉ tiêu đánh giá: seq={}, itemCode={}", dto.getSeq(), dto.getItemCode());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu chỉ tiêu đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteBatch(List<String> seqs) {
        try {
            for (String seq : seqs) {
                mapper.deleteBySeq(seq);
                log.info("Xóa chỉ tiêu đánh giá: seq={}", seq);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa chỉ tiêu đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }
}
