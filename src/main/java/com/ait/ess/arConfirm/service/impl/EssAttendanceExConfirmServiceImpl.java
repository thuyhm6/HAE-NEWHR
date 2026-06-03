package com.ait.ess.arConfirm.service.impl;

import com.ait.ess.arConfirm.dto.EssAttendanceExConfirmDto;
import com.ait.ess.arConfirm.mapper.EssAttendanceExConfirmMapper;
import com.ait.ess.arConfirm.service.EssAttendanceExConfirmService;
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
public class EssAttendanceExConfirmServiceImpl implements EssAttendanceExConfirmService {

    private static final Logger log = LoggerFactory.getLogger(EssAttendanceExConfirmServiceImpl.class);

    @Autowired
    private EssAttendanceExConfirmMapper mapper;

    @Override
    public DataTablesResponse<EssAttendanceExConfirmDto> getPageList(EssAttendanceExConfirmDto dto) {
        try {
            int total = mapper.countList(dto);
            List<EssAttendanceExConfirmDto> data = total > 0
                    ? mapper.selectListPage(dto)
                    : Collections.emptyList();
            return new DataTablesResponse<>(dto.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("[EssAttendanceExConfirmService] getPageList error", e);
            return new DataTablesResponse<>(dto.getDraw(), "Lỗi hệ thống khi tải danh sách xác nhận nghỉ bất thường.");
        }
    }

    @Override
    @Transactional
    public String confirmAttendanceEx(String applyNo, String flag, String hrComment) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("applyNo", applyNo);
            params.put("flag", flag);
            params.put("hrComment", hrComment != null ? hrComment : "");
            params.put("message", "");
            mapper.callAttendanceExConfirm(params);
            return (String) params.get("message");
        } catch (Exception e) {
            log.error("[EssAttendanceExConfirmService] confirmAttendanceEx error, applyNo={}, flag={}", applyNo, flag, e);
            throw new RuntimeException("Lỗi hệ thống khi xác nhận đơn " + applyNo, e);
        }
    }
}
