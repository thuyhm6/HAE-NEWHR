package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArAttendanceSearchDto;
import com.ait.ar.attendanceMintenance.mapper.ArAttendanceSearchMapper;
import com.ait.ar.attendanceMintenance.service.ArAttendanceSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ArAttendanceSearchServiceImpl implements ArAttendanceSearchService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private ArAttendanceSearchMapper mapper;

    @Override
    public List<ArAttendanceSearchDto> getAttendanceSearchList(ArAttendanceSearchDto params) {
        ArAttendanceSearchDto safeParams = params == null ? new ArAttendanceSearchDto() : params;

        String fromDate = safeString(safeParams.getFromDate());
        String toDate = safeString(safeParams.getToDate());
        if (fromDate.isEmpty() || toDate.isEmpty()) {
            LocalDate today = LocalDate.now();
            if (fromDate.isEmpty()) {
                safeParams.setFromDate(today.minusDays(1).format(DATE_FORMATTER));
            }
            if (toDate.isEmpty()) {
                safeParams.setToDate(today.format(DATE_FORMATTER));
            }
        }
        return mapper.selectAttendanceSearchList(safeParams);
    }

    @Override
    public List<ArAttendanceSearchDto> getAttendanceOtSearchList(ArAttendanceSearchDto params) {
        ArAttendanceSearchDto safeParams = params == null ? new ArAttendanceSearchDto() : params;

        String fromDate = safeString(safeParams.getFromDate());
        String toDate = safeString(safeParams.getToDate());
        if (fromDate.isEmpty() || toDate.isEmpty()) {
            LocalDate today = LocalDate.now();
            if (fromDate.isEmpty()) {
                safeParams.setFromDate(today.minusDays(1).format(DATE_FORMATTER));
            }
            if (toDate.isEmpty()) {
                safeParams.setToDate(today.format(DATE_FORMATTER));
            }
        }
        return mapper.selectAttendanceOtSearchList(safeParams);
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
