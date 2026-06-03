package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsParamDto;
import com.ait.evs.manage.mapper.EvsParamMapper;
import com.ait.evs.manage.service.EvsParamService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsParamServiceImpl implements EvsParamService {

    private static final Logger log = LoggerFactory.getLogger(EvsParamServiceImpl.class);

    @Autowired
    private EvsParamMapper mapper;

    @Override
    public List<EvsParamDto> getList(EvsParamDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách tiêu chuẩn ({}): {}", params.getParamType(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<EvsParamDto> getGroupOptions(String resumeSeq) {
        try {
            EvsParamDto dto = new EvsParamDto();
            dto.setResumeSeq(resumeSeq);
            return mapper.selectGroupOptions(dto);
        } catch (Exception e) {
            log.error("Lỗi khi lấy options nhóm đánh giá: resumeSeq={}, {}", resumeSeq, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveBatch(List<EvsParamDto> list) {
        try {
            for (EvsParamDto dto : list) {
                if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                    dto.setSeq(mapper.getNextSeq());
                    mapper.insert(dto);
                    log.info("Thêm mới tiêu chuẩn: seq={}, paramType={}", dto.getSeq(), dto.getParamType());
                } else {
                    mapper.update(dto);
                    log.info("Cập nhật tiêu chuẩn: seq={}, paramType={}", dto.getSeq(), dto.getParamType());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu tiêu chuẩn: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteBatch(List<String> seqs) {
        try {
            for (String seq : seqs) {
                mapper.deleteBySeq(seq);
                log.info("Xóa tiêu chuẩn: seq={}", seq);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa tiêu chuẩn: {}", e.getMessage(), e);
            throw e;
        }
    }
}
