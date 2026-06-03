package com.ait.ess.infoApplyLeave.service.impl;

import com.ait.ess.infoApplyLeave.dto.EssCardApplyListDto;
import com.ait.ess.infoApplyLeave.mapper.EssCardApplyListMapper;
import com.ait.ess.infoApplyLeave.service.EssCardApplyListService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.Collections;
import java.util.List;

@Service
public class EssCardApplyListServiceImpl implements EssCardApplyListService {

    private static final Logger log = LoggerFactory.getLogger(EssCardApplyListServiceImpl.class);
    private static final DateTimeFormatter DD_MM_YYYY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Autowired
    private EssCardApplyListMapper mapper;

    @Override
    public List<EssCardApplyListDto> getMyList(EssCardApplyListDto dto) {
        try {
            EssCardApplyListDto params = dto != null ? dto : new EssCardApplyListDto();
            if (isEmpty(params.getStartDate()) || isEmpty(params.getEndDate())) {
                LocalDate today = LocalDate.now();
                if (isEmpty(params.getStartDate())) {
                    params.setStartDate(today.with(TemporalAdjusters.firstDayOfMonth()).format(DD_MM_YYYY));
                }
                if (isEmpty(params.getEndDate())) {
                    params.setEndDate(today.with(TemporalAdjusters.lastDayOfMonth()).format(DD_MM_YYYY));
                }
            }
            List<EssCardApplyListDto> result = mapper.selectMyCardApplyList(params);
            return result != null ? result : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get card apply list", e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public int cancelMyList(List<String> applyNos) {
        if (applyNos == null || applyNos.isEmpty()) return 0;
        int lockedDetail = mapper.countLockedByArDetail(applyNos);
        log.debug("countLockedByArDetail={}", lockedDetail);
        if (lockedDetail > 0) {
            throw new IllegalStateException("essLeave.error.locked");
        }
        int lockedDept = mapper.countLockedByDeptManage(applyNos);
        log.debug("countLockedByDeptManage={}", lockedDept);
        if (lockedDept > 0) {
            throw new IllegalStateException("essLeave.error.locked");
        }
        return mapper.cancelMyCardApplyList(applyNos);
    }

    private boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }
}
