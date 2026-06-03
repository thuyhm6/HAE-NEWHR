package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordDayDto;
import com.ait.ar.attendanceMintenance.mapper.ArCardRecordDayMapper;
import com.ait.ar.attendanceMintenance.service.ArCardRecordDayService;
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
public class ArCardRecordDayServiceImpl implements ArCardRecordDayService {

    private static final Logger log = LoggerFactory.getLogger(ArCardRecordDayServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private ArCardRecordDayMapper mapper;

    @Override
    public DataTablesResponse<ArCardRecordDayDto> getPageList(ArCardRecordDayDto dto) {
        try {
            if (dto == null) dto = new ArCardRecordDayDto();
            applyDefaultDateRange(dto);
            int total = mapper.countList(dto);
            List<ArCardRecordDayDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[ArCardRecordDayService] getPageList error", e);
            return new DataTablesResponse<>(dto != null ? dto.getDraw() : 1,
                    "Lỗi hệ thống khi tải danh sách dữ liệu quẹt thẻ theo ngày.");
        }
    }

    @Override
    public List<ArCardRecordDayDto> getExportList(ArCardRecordDayDto dto) {
        try {
            if (dto == null) dto = new ArCardRecordDayDto();
            applyDefaultDateRange(dto);
            return mapper.selectListAll(dto);
        } catch (Exception e) {
            log.error("[ArCardRecordDayService] getExportList error", e);
            return Collections.emptyList();
        }
    }

    private void applyDefaultDateRange(ArCardRecordDayDto dto) {
        LocalDate today = LocalDate.now();
        if (dto.getFromDate() == null || dto.getFromDate().isBlank()) {
            dto.setFromDate(today.format(DATE_FORMAT));
        }
        if (dto.getToDate() == null || dto.getToDate().isBlank()) {
            dto.setToDate(today.format(DATE_FORMAT));
        }
    }
}
