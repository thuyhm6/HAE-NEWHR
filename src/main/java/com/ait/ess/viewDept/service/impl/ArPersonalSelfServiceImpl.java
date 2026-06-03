package com.ait.ess.viewDept.service.impl;

import com.ait.ess.viewDept.dto.ArPersonalSelfDetailDto;
import com.ait.ess.viewDept.dto.ArPersonalSelfDto;
import com.ait.ess.viewDept.mapper.ArPersonalSelfMapper;
import com.ait.ess.viewDept.service.ArPersonalSelfService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArPersonalSelfServiceImpl implements ArPersonalSelfService {

    private static final Logger log = LoggerFactory.getLogger(ArPersonalSelfServiceImpl.class);

    @Autowired
    private ArPersonalSelfMapper mapper;

    @Override
    public List<ArPersonalSelfDto> getSummaryList(ArPersonalSelfDto params) {
        try {
            return mapper.selectSummaryList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy dữ liệu tình hình chấm công: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<ArPersonalSelfDto> getItemList() {
        try {
            return mapper.selectItemList();
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách loại chấm công: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<ArPersonalSelfDetailDto> getDetailList(ArPersonalSelfDetailDto params) {
        try {
            return mapper.selectDetailList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết chấm công nhân viên {}: {}", params.getPersonId(), e.getMessage(), e);
            throw e;
        }
    }
}
