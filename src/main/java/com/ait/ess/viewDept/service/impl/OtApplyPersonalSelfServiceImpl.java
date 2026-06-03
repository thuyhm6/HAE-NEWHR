package com.ait.ess.viewDept.service.impl;

import com.ait.ess.viewDept.dto.OtApplyPersonalSelfDetailDto;
import com.ait.ess.viewDept.dto.OtApplyPersonalSelfDto;
import com.ait.ess.viewDept.mapper.OtApplyPersonalSelfMapper;
import com.ait.ess.viewDept.service.OtApplyPersonalSelfService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OtApplyPersonalSelfServiceImpl implements OtApplyPersonalSelfService {

    private static final Logger log = LoggerFactory.getLogger(OtApplyPersonalSelfServiceImpl.class);

    @Autowired
    private OtApplyPersonalSelfMapper mapper;

    @Override
    public List<OtApplyPersonalSelfDto> getSummaryList(OtApplyPersonalSelfDto params) {
        try {
            return mapper.selectSummaryList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy dữ liệu tình hình tăng ca: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<OtApplyPersonalSelfDto> getItemList() {
        try {
            return mapper.selectItemList();
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách loại tăng ca: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<OtApplyPersonalSelfDetailDto> getDetailList(OtApplyPersonalSelfDetailDto params) {
        try {
            return mapper.selectDetailList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết tăng ca nhân viên {}: {}", params.getPersonId(), e.getMessage(), e);
            throw e;
        }
    }
}
