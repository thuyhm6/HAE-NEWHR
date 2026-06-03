package com.ait.ess.infoApplyAttendance.service.impl;

import com.ait.ess.infoApplyAttendance.dto.EssCoordApplyAttendanceDto;
import com.ait.ess.infoApplyAttendance.mapper.EssCoordApplyAttendanceMapper;
import com.ait.ess.infoApplyAttendance.service.EssCoordApplyAttendanceService;
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
public class EssCoordApplyAttendanceServiceImpl implements EssCoordApplyAttendanceService {

    private static final Logger log = LoggerFactory.getLogger(EssCoordApplyAttendanceServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    @Autowired
    private EssCoordApplyAttendanceMapper mapper;

    @Override
    public DataTablesResponse<EssCoordApplyAttendanceDto> getPageList(EssCoordApplyAttendanceDto dto) {
        try {
            if (dto == null) {
                dto = new EssCoordApplyAttendanceDto();
            }
            applyDefaultDateRange(dto);
            int total = mapper.countList(dto);
            List<EssCoordApplyAttendanceDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[EssCoordApplyAttendanceService] getPageList error", e);
            return new DataTablesResponse<>(dto != null ? dto.getDraw() : 1, "Lỗi hệ thống khi tải danh sách tra cứu chấm công.");
        }
    }

    private void applyDefaultDateRange(EssCoordApplyAttendanceDto dto) {
        String startDate = dto.getStartDate();
        String endDate = dto.getEndDate();
        LocalDate today = LocalDate.now();
        if (startDate == null || startDate.isBlank()) {
            dto.setStartDate(today.minusDays(1).format(DATE_FORMAT));
        }
        if (endDate == null || endDate.isBlank()) {
            dto.setEndDate(today.format(DATE_FORMAT));
        }
    }
}
