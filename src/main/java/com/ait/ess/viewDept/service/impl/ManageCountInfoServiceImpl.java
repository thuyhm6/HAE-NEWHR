package com.ait.ess.viewDept.service.impl;

import com.ait.ess.viewDept.dto.ManageCountInfoEmpDto;
import com.ait.ess.viewDept.dto.ManageCountInfoSummaryDto;
import com.ait.ess.viewDept.mapper.ManageCountInfoMapper;
import com.ait.ess.viewDept.service.ManageCountInfoService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ManageCountInfoServiceImpl implements ManageCountInfoService {

    private static final Logger log = LoggerFactory.getLogger(ManageCountInfoServiceImpl.class);

    @Autowired
    private ManageCountInfoMapper mapper;

    @Override
    public ManageCountInfoSummaryDto getSummary(ManageCountInfoEmpDto params) {
        try {
            ManageCountInfoSummaryDto summary = new ManageCountInfoSummaryDto();
            summary.setTotalCount(mapper.countTotal(params));
            summary.setByGender(mapper.countByGender(params));
            summary.setByEmpType(mapper.countByEmpType(params));
            summary.setByDept(mapper.countByDept(params));
            summary.setByPostFamily(mapper.countByPostFamily(params));
            summary.setByPostGrade(mapper.countByPostGrade(params));
            summary.setByAge(mapper.countByAge(params));
            return summary;
        } catch (Exception e) {
            log.error("Lỗi khi lấy thống kê nhân sự: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public DataTablesResponse<ManageCountInfoEmpDto> getPageList(ManageCountInfoEmpDto params) {
        try {
            int total = mapper.countList(params);
            List<ManageCountInfoEmpDto> list = mapper.selectListPage(params);
            return new DataTablesResponse<>(params.getDraw(), total, total, list);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách nhân viên thống kê: {}", e.getMessage(), e);
            throw e;
        }
    }
}
