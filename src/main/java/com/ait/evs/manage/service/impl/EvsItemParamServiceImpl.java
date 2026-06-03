package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsItemParamDto;
import com.ait.evs.manage.mapper.EvsItemParamMapper;
import com.ait.evs.manage.service.EvsItemParamService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsItemParamServiceImpl implements EvsItemParamService {

    private static final Logger log = LoggerFactory.getLogger(EvsItemParamServiceImpl.class);

    @Autowired
    private EvsItemParamMapper mapper;

    @Override
    public List<EvsItemParamDto> getList(EvsItemParamDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục chỉ tiêu: resumeSeq={}, {}", params.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveBatch(List<EvsItemParamDto> list) {
        try {
            for (EvsItemParamDto dto : list) {
                if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                    dto.setSeq(mapper.getNextSeq());
                    mapper.insert(dto);
                    log.info("Thêm mới hạng mục chỉ tiêu: seq={}, itemCode={}", dto.getSeq(), dto.getItemCode());
                } else {
                    mapper.update(dto);
                    log.info("Cập nhật hạng mục chỉ tiêu: seq={}, itemCode={}", dto.getSeq(), dto.getItemCode());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu hạng mục chỉ tiêu: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteBatch(List<String> seqs) {
        try {
            for (String seq : seqs) {
                mapper.deleteBySeq(seq);
                log.info("Xóa hạng mục chỉ tiêu: seq={}", seq);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa hạng mục chỉ tiêu: {}", e.getMessage(), e);
            throw e;
        }
    }
}
