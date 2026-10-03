package com.ait.ess.infoApply.service.impl;

import com.ait.ess.infoApply.dto.EssApplyOtBatchHAEDto;
import com.ait.ess.infoApply.mapper.EssApplyOtBatchHAEMapper;
import com.ait.ess.infoApply.service.EssApplyOtBatchHAEService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

@Service
public class EssApplyOtBatchHAEServiceImpl implements EssApplyOtBatchHAEService {

    private static final Logger log = LoggerFactory.getLogger(EssApplyOtBatchHAEServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    @Autowired
    private EssApplyOtBatchHAEMapper mapper;

    @Override
    public DataTablesResponse<EssApplyOtBatchHAEDto> getPageList(EssApplyOtBatchHAEDto dto) {
        try {
            if (dto == null) {
                dto = new EssApplyOtBatchHAEDto();
            }
            applyDefaultDateRange(dto);
            int total = mapper.countList(dto);
            List<EssApplyOtBatchHAEDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[EssApplyOtBatchHAEService] getPageList error", e);
            return new DataTablesResponse<>(dto != null ? dto.getDraw() : 1, "Lỗi hệ thống khi tải danh sách chi tiết tăng ca vượt.");
        }
    }

    @Override
    public List<EssApplyOtBatchHAEDto> getOtItemList() {
        try {
            return mapper.selectOtItemList(new EssApplyOtBatchHAEDto());
        } catch (Exception e) {
            log.error("[EssApplyOtBatchHAEService] getOtItemList error", e);
            return Collections.emptyList();
        }
    }

    private void applyDefaultDateRange(EssApplyOtBatchHAEDto dto) {
        LocalDate today = LocalDate.now();
        if (dto.getStartDate() == null || dto.getStartDate().trim().isEmpty()) {
            dto.setStartDate(today.minusDays(1).format(DATE_FORMAT));
        }
        if (dto.getEndDate() == null || dto.getEndDate().trim().isEmpty()) {
            dto.setEndDate(today.format(DATE_FORMAT));
        }
    }
}
