package com.ait.ess.infoApplyAttendance.service.impl;

import com.ait.ess.infoApplyAttendance.dto.EssAttendancePersonalInfoDto;
import com.ait.ess.infoApplyAttendance.mapper.EssAttendancePersonalInfoMapper;
import com.ait.ess.infoApplyAttendance.service.EssAttendancePersonalInfoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.Collections;
import java.util.List;

@Service
public class EssAttendancePersonalInfoServiceImpl implements EssAttendancePersonalInfoService {

    private static final Logger log = LoggerFactory.getLogger(EssAttendancePersonalInfoServiceImpl.class);
    private static final DateTimeFormatter DD_MM_YYYY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Autowired
    private EssAttendancePersonalInfoMapper mapper;

    @Override
    public List<EssAttendancePersonalInfoDto> getPersonalAttendanceList(EssAttendancePersonalInfoDto dto) {
        try {
            EssAttendancePersonalInfoDto params = dto != null ? dto : new EssAttendancePersonalInfoDto();
            if (isEmpty(params.getStartDate()) || isEmpty(params.getEndDate())) {
                LocalDate today = LocalDate.now();
                if (isEmpty(params.getStartDate())) {
                    params.setStartDate(today.with(TemporalAdjusters.firstDayOfMonth()).format(DD_MM_YYYY));
                }
                if (isEmpty(params.getEndDate())) {
                    params.setEndDate(today.with(TemporalAdjusters.lastDayOfMonth()).format(DD_MM_YYYY));
                }
            }
            List<EssAttendancePersonalInfoDto> result = mapper.selectPersonalAttendanceList(params);
            return result != null ? result : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get personal attendance list", e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<EssAttendancePersonalInfoDto> getAttendanceItemList() {
        try {
            List<EssAttendancePersonalInfoDto> result = mapper.selectAttendanceItemList(new EssAttendancePersonalInfoDto());
            return result != null ? result : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get attendance item list", e);
            return Collections.emptyList();
        }
    }

    private boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }
}
