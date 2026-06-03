package com.ait.ess.infoApply.service.impl;

import com.ait.ess.infoApply.dto.EssPersonOtInfoDto;
import com.ait.ess.infoApply.mapper.EssPersonOtInfoMapper;
import com.ait.ess.infoApply.service.EssPersonOtInfoService;
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
public class EssPersonOtInfoServiceImpl implements EssPersonOtInfoService {

    private static final Logger log = LoggerFactory.getLogger(EssPersonOtInfoServiceImpl.class);
    private static final DateTimeFormatter DD_MM_YYYY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Autowired
    private EssPersonOtInfoMapper mapper;

    @Override
    public List<EssPersonOtInfoDto> getPersonOtList(EssPersonOtInfoDto dto) {
        try {
            EssPersonOtInfoDto params = dto != null ? dto : new EssPersonOtInfoDto();
            if (isEmpty(params.getStartDate()) || isEmpty(params.getEndDate())) {
                LocalDate today = LocalDate.now();
                if (isEmpty(params.getStartDate())) {
                    params.setStartDate(today.with(TemporalAdjusters.firstDayOfMonth()).format(DD_MM_YYYY));
                }
                if (isEmpty(params.getEndDate())) {
                    params.setEndDate(today.with(TemporalAdjusters.lastDayOfMonth()).format(DD_MM_YYYY));
                }
            }
            List<EssPersonOtInfoDto> result = mapper.selectPersonOtList(params);
            return result != null ? result : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get personal OT list", e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<EssPersonOtInfoDto> getOtItemList() {
        try {
            List<EssPersonOtInfoDto> result = mapper.selectOtItemList(new EssPersonOtInfoDto());
            return result != null ? result : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get OT item list", e);
            return Collections.emptyList();
        }
    }

    private boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }
}
