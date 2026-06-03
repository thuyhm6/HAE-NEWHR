package com.ait.ess.viewDept.service.impl;

import com.ait.ess.viewDept.dto.EssEntryInfoListDto;
import com.ait.ess.viewDept.mapper.EssEntryInfoListMapper;
import com.ait.ess.viewDept.service.EssEntryInfoListService;
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
public class EssEntryInfoListServiceImpl implements EssEntryInfoListService {

    private static final Logger log = LoggerFactory.getLogger(EssEntryInfoListServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private EssEntryInfoListMapper mapper;

    @Override
    public DataTablesResponse<EssEntryInfoListDto> getPageList(EssEntryInfoListDto dto) {
        try {
            if (dto == null) dto = new EssEntryInfoListDto();
            applyDefaultDateRange(dto);
            int total = mapper.countList(dto);
            List<EssEntryInfoListDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[EssEntryInfoListService] getPageList error", e);
            return new DataTablesResponse<>(dto != null ? dto.getDraw() : 1,
                    "Lỗi hệ thống khi tải danh sách dữ liệu quẹt thẻ.");
        }
    }

    private void applyDefaultDateRange(EssEntryInfoListDto dto) {
        LocalDate today = LocalDate.now();
        if (dto.getFromDate() == null || dto.getFromDate().isBlank()) {
            dto.setFromDate(today.format(DATE_FORMAT));
        }
        if (dto.getToDate() == null || dto.getToDate().isBlank()) {
            dto.setToDate(today.format(DATE_FORMAT));
        }
    }
}
