package com.ait.ar.countAttendance.service.impl;

import com.ait.ar.countAttendance.dto.ArCountInfoListOtDto;
import com.ait.ar.countAttendance.mapper.ArCountInfoListMapper;
import com.ait.ar.countAttendance.service.ArCountInfoListService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ArCountInfoListServiceImpl implements ArCountInfoListService {

    private static final Logger log = LoggerFactory.getLogger(ArCountInfoListServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Autowired
    private ArCountInfoListMapper arCountInfoListMapper;

    @Override
    public List<ArCountInfoListOtDto> getOtSummaryList(ArCountInfoListOtDto params) {
        try {
            ArCountInfoListOtDto safeParams = params == null ? new ArCountInfoListOtDto() : params;
            if (safeParams.getStartTime() == null || safeParams.getStartTime().trim().isEmpty()) {
                safeParams.setStartTime(LocalDate.now().format(DATE_FORMAT));
            }
            return arCountInfoListMapper.selectOtSummaryList(safeParams);
        } catch (Exception e) {
            log.error("Lỗi khi lấy tổng hợp tăng ca theo tháng: {}", e.getMessage(), e);
            throw e;
        }
    }
}
