package com.ait.ess.arConfirm.service.impl;

import com.ait.ess.arConfirm.dto.EssLeaveConfirmDto;
import com.ait.ess.arConfirm.mapper.EssLeaveConfirmMapper;
import com.ait.ess.arConfirm.service.EssLeaveConfirmService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EssLeaveConfirmServiceImpl implements EssLeaveConfirmService {

    private static final Logger log = LoggerFactory.getLogger(EssLeaveConfirmServiceImpl.class);

    @Autowired
    private EssLeaveConfirmMapper mapper;

    @Override
    public DataTablesResponse<EssLeaveConfirmDto> getPageList(EssLeaveConfirmDto dto) {
        try {
            int total = mapper.countList(dto);
            List<EssLeaveConfirmDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[EssLeaveConfirmService] getPageList error", e);
            return new DataTablesResponse<>(dto.getDraw(), "Lỗi hệ thống khi tải danh sách xác nhận nghỉ phép.");
        }
    }

    @Override
    @Transactional
    public String confirmLeave(String applyNo, String flag, String hrComment) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("applyNo", applyNo);
            params.put("flag", flag);
            params.put("hrComment", hrComment != null ? hrComment : "");
            params.put("message", "");
            mapper.callLeaveConfirm(params);
            return (String) params.get("message");
        } catch (Exception e) {
            log.error("[EssLeaveConfirmService] confirmLeave error, applyNo={}, flag={}", applyNo, flag, e);
            throw new RuntimeException("Lỗi hệ thống khi xác nhận đơn " + applyNo, e);
        }
    }
}
