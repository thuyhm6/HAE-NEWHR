package com.ait.pa.workManagement.service.impl;

import com.ait.pa.workManagement.dto.PaSalaryDetailItemDto;
import com.ait.pa.workManagement.dto.PaSalaryEmpDto;
import com.ait.pa.workManagement.dto.PaSalaryResultQueryDto;
import com.ait.pa.workManagement.mapper.PaSalaryResultMapper;
import com.ait.pa.workManagement.service.PaSalaryResultService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaSalaryResultServiceImpl implements PaSalaryResultService {

    private static final Logger log = LoggerFactory.getLogger(PaSalaryResultServiceImpl.class);

    /** Loại hạng mục procedure PA_FOR_MY_SALARY_DETAIL_PAGE_P sinh dữ liệu (1 chi trả, 2 khấu trừ, 3 khác) */
    private static final int[] DETAIL_ITEM_TYPES = {1, 2, 3};

    @Autowired
    private PaSalaryResultMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<PaSalaryEmpDto> getMonthEmpList(PaSalaryResultQueryDto query) {
        log.info("Lấy danh sách lương tháng chi tiết, payScheduleNo={}, key={}, deptNo={}",
                query.getPayScheduleNo(), query.getKey(), query.getDeptNo());
        if (isBlank(query.getPayScheduleNo())) {
            return Collections.emptyList();
        }
        try {
            return mapper.selectMonthEmpList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách lương tháng chi tiết payScheduleNo={}", query.getPayScheduleNo(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaSalaryEmpDto> getYearEmpList(PaSalaryResultQueryDto query) {
        log.info("Lấy danh sách lương năm chi tiết, personId={}, {} - {}",
                query.getPersonId(), query.getStartMonth(), query.getEndMonth());
        // Bản gốc chỉ truy vấn khi có đủ nhân viên + khoảng tháng
        if (isBlank(query.getPersonId()) || isBlank(query.getStartMonth()) || isBlank(query.getEndMonth())) {
            return Collections.emptyList();
        }
        try {
            return mapper.selectYearEmpList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách lương năm chi tiết personId={}", query.getPersonId(), e);
            throw e;
        }
    }

    /**
     * Procedure ghi dữ liệu tạm vào PA_MY_SALARY_PAGE_DATA rồi mới đọc ra (giống bản gốc) nên cần
     * transaction ghi, không đặt readOnly.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<PaSalaryDetailItemDto> getMonthDetail(PaSalaryResultQueryDto query) {
        log.info("Lấy chi tiết lương tháng, payScheduleNo={}, personId={}", query.getPayScheduleNo(), query.getPersonId());
        if (isBlank(query.getPersonId()) || isBlank(query.getPayScheduleNo())) {
            return Collections.emptyList();
        }
        try {
            for (int itemType : DETAIL_ITEM_TYPES) {
                query.setItemType(itemType);
                mapper.callMonthDetailProc(query);
            }
            return mapper.selectDetailItemList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết lương tháng payScheduleNo={}, personId={}",
                    query.getPayScheduleNo(), query.getPersonId(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<PaSalaryDetailItemDto> getYearDetail(PaSalaryResultQueryDto query) {
        log.info("Lấy chi tiết lương năm, payDate={}, personId={}, {} - {}",
                query.getPayDate(), query.getPersonId(), query.getStartMonth(), query.getEndMonth());
        if (isBlank(query.getPersonId()) || isBlank(query.getPayDate())) {
            return Collections.emptyList();
        }
        try {
            for (int itemType : DETAIL_ITEM_TYPES) {
                query.setItemType(itemType);
                mapper.callYearDetailProc(query);
            }
            return mapper.selectDetailItemList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết lương năm payDate={}, personId={}", query.getPayDate(), query.getPersonId(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPersonResult(PaSalaryResultQueryDto query) {
        log.info("Lấy tổng hợp lương (cá nhân), payScheduleNo={}, key={}, deptNos={}",
                query.getPayScheduleNo(), query.getKey(), query.getDeptNos());
        if (isBlank(query.getPayScheduleNo())) {
            return result(Collections.emptyList(), null);
        }
        try {
            return result(mapper.selectPersonResultList(query), mapper.selectPersonResultSum(query));
        } catch (Exception e) {
            log.error("Lỗi khi lấy tổng hợp lương (cá nhân) payScheduleNo={}", query.getPayScheduleNo(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDeptResult(PaSalaryResultQueryDto query) {
        log.info("Lấy tổng hợp lương (phòng ban), payScheduleNo={}, deptNos={}", query.getPayScheduleNo(), query.getDeptNos());
        if (isBlank(query.getPayScheduleNo())) {
            return result(Collections.emptyList(), null);
        }
        try {
            return result(mapper.selectDeptResultList(query), mapper.selectDeptResultSum(query));
        } catch (Exception e) {
            log.error("Lỗi khi lấy tổng hợp lương (phòng ban) payScheduleNo={}", query.getPayScheduleNo(), e);
            throw e;
        }
    }

    private static Map<String, Object> result(List<Map<String, Object>> list, Map<String, Object> sum) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("list", list);
        map.put("sum", sum);
        return map;
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
