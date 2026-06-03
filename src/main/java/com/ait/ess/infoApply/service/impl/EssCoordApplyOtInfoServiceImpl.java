package com.ait.ess.infoApply.service.impl;

import com.ait.ess.infoApply.dto.EssCoordApplyOtInfoDto;
import com.ait.ess.infoApply.mapper.EssCoordApplyOtInfoMapper;
import com.ait.ess.infoApply.service.EssCoordApplyOtInfoService;
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
public class EssCoordApplyOtInfoServiceImpl implements EssCoordApplyOtInfoService {

    private static final Logger log = LoggerFactory.getLogger(EssCoordApplyOtInfoServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    @Autowired
    private EssCoordApplyOtInfoMapper mapper;

    @Override
    public DataTablesResponse<EssCoordApplyOtInfoDto> getPageList(EssCoordApplyOtInfoDto dto) {
        try {
            if (dto == null) {
                dto = new EssCoordApplyOtInfoDto();
            }
            applyDefaultDateRange(dto);
            int total = mapper.countList(dto);
            List<EssCoordApplyOtInfoDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[EssCoordApplyOtInfoService] getPageList error", e);
            return new DataTablesResponse<>(dto != null ? dto.getDraw() : 1, "Lỗi hệ thống khi tải danh sách tra cứu tăng ca.");
        }
    }

    @Override
    public List<EssCoordApplyOtInfoDto> getOtItemList() {
        try {
            return mapper.selectOtItemList(new EssCoordApplyOtInfoDto());
        } catch (Exception e) {
            log.error("[EssCoordApplyOtInfoService] getOtItemList error", e);
            return Collections.emptyList();
        }
    }

    private void applyDefaultDateRange(EssCoordApplyOtInfoDto dto) {
        LocalDate today = LocalDate.now();
        if (dto.getStartDate() == null || dto.getStartDate().isBlank()) {
            dto.setStartDate(today.minusDays(1).format(DATE_FORMAT));
        }
        if (dto.getEndDate() == null || dto.getEndDate().isBlank()) {
            dto.setEndDate(today.format(DATE_FORMAT));
        }
    }
}
