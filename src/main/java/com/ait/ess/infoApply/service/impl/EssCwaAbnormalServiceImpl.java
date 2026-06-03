package com.ait.ess.infoApply.service.impl;

import com.ait.ess.infoApply.dto.EssCwaAbnormalDto;
import com.ait.ess.infoApply.mapper.EssCwaAbnormalMapper;
import com.ait.ess.infoApply.service.EssCwaAbnormalService;
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
public class EssCwaAbnormalServiceImpl implements EssCwaAbnormalService {

    private static final Logger log = LoggerFactory.getLogger(EssCwaAbnormalServiceImpl.class);
    private static final DateTimeFormatter DD_MM_YYYY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Autowired
    private EssCwaAbnormalMapper mapper;

    @Override
    public List<EssCwaAbnormalDto> getMyList(EssCwaAbnormalDto dto) {
        try {
            EssCwaAbnormalDto params = dto != null ? dto : new EssCwaAbnormalDto();
            if (isEmpty(params.getStartDate()) || isEmpty(params.getEndDate())) {
                LocalDate today = LocalDate.now();
                if (isEmpty(params.getStartDate())) {
                    params.setStartDate(today.with(TemporalAdjusters.firstDayOfMonth()).format(DD_MM_YYYY));
                }
                if (isEmpty(params.getEndDate())) {
                    params.setEndDate(today.with(TemporalAdjusters.lastDayOfMonth()).format(DD_MM_YYYY));
                }
            }
            List<EssCwaAbnormalDto> result = mapper.selectMyCwaAbnormalList(params);
            return result != null ? result : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get CWA abnormal list", e);
            return Collections.emptyList();
        }
    }

    private boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }
}
