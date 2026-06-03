package com.ait.ess.viewDept.service.impl;

import com.ait.ess.viewDept.dto.YearUseLeaveUsageDto;
import com.ait.ess.viewDept.dto.YearUseVacationDto;
import com.ait.ess.viewDept.mapper.YearUseInfoMapper;
import com.ait.ess.viewDept.service.YearUseInfoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class YearUseInfoServiceImpl implements YearUseInfoService {

    private static final Logger log = LoggerFactory.getLogger(YearUseInfoServiceImpl.class);

    @Autowired
    private YearUseInfoMapper mapper;

    @Override
    public List<YearUseVacationDto> getVacationRows(String year) {
        try {
            return mapper.selectVacationRowsByYear(year);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin nghỉ phép năm {}: {}", year, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<YearUseLeaveUsageDto> getLeaveUsageList(String year) {
        try {
            return mapper.selectLeaveUsageByYear(year);
        } catch (Exception e) {
            log.error("Lỗi khi lấy tình trạng sử dụng phép năm {}: {}", year, e.getMessage(), e);
            throw e;
        }
    }
}
