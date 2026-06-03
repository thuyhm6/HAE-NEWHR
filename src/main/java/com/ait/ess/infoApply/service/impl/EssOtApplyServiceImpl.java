package com.ait.ess.infoApply.service.impl;

import com.ait.ess.infoApply.dto.EssOtApplyListDto;
import com.ait.ess.infoApply.mapper.EssOtApplyMapper;
import com.ait.ess.infoApply.service.EssOtApplyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EssOtApplyServiceImpl implements EssOtApplyService {

    private static final Logger log = LoggerFactory.getLogger(EssOtApplyServiceImpl.class);

    @Autowired
    private EssOtApplyMapper mapper;

    @Override
    public Map<String, Object> getOtDateInfo(String applyDate) {
        if (applyDate == null || applyDate.trim().isEmpty()) {
            return new HashMap<>();
        }
        try {
            Map<String, Object> result = mapper.selectOtDateInfo(applyDate.trim());
            return result != null ? result : new HashMap<>();
        } catch (Exception e) {
            log.error("Failed to get OT date info for applyDate={}", applyDate, e);
            return new HashMap<>();
        }
    }

    @Override
    public Map<String, Object> getOtDuration(String applyOtDate, String otFromTime, String otToTime, String deductYn) {
        try {
            Map<String, Object> result = mapper.selectOtDuration(applyOtDate, otFromTime, otToTime, deductYn);
            return result != null ? result : new HashMap<>();
        } catch (Exception e) {
            log.error("Failed to get OT duration for applyOtDate={}", applyOtDate, e);
            return new HashMap<>();
        }
    }

    @Override
    public List<EssOtApplyListDto> getMyOtApplyList(EssOtApplyListDto dto) {
        List<EssOtApplyListDto> result = mapper.selectMyOtApplyList(dto);
        return result != null ? result : Collections.emptyList();
    }

    @Override
    @Transactional
    public int cancelMyOtApplyList(List<String> applyNos) {
        if (applyNos == null || applyNos.isEmpty()) return 0;
        try {
            int lockedCount = mapper.countLockedOtApply(applyNos);
            if (lockedCount > 0) {
                throw new RuntimeException("Đơn nghỉ phép này đã bị khóa, không thể hủy bỏ!");
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to check lock status for applyNos={}", applyNos, e);
            throw new RuntimeException("Lỗi kiểm tra trạng thái khóa.", e);
        }
        return mapper.cancelMyOtApplyList(applyNos);
    }
}
