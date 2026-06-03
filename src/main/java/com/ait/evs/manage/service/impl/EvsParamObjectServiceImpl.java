package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsParamObjectDto;
import com.ait.evs.manage.mapper.EvsParamObjectMapper;
import com.ait.evs.manage.service.EvsParamObjectService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsParamObjectServiceImpl implements EvsParamObjectService {

    private static final Logger log = LoggerFactory.getLogger(EvsParamObjectServiceImpl.class);

    @Autowired
    private EvsParamObjectMapper mapper;

    @Override
    public List<EvsParamObjectDto> getList(EvsParamObjectDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đối tượng đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveBatch(List<EvsParamObjectDto> list) {
        try {
            for (EvsParamObjectDto dto : list) {
                if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                    dto.setSeq(mapper.getNextSeq());
                    mapper.insert(dto);
                    log.info("Thêm mới đối tượng đánh giá: seq={}", dto.getSeq());
                } else {
                    mapper.update(dto);
                    log.info("Cập nhật đối tượng đánh giá: seq={}", dto.getSeq());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu đối tượng đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteBatch(List<String> seqs) {
        try {
            for (String seq : seqs) {
                mapper.deleteBySeq(seq);
                log.info("Xóa đối tượng đánh giá: seq={}", seq);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa đối tượng đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }
}
