package com.ait.pa.workManagement.service.impl;

import com.ait.pa.workManagement.dto.PaWorkFlowDto;
import com.ait.pa.workManagement.dto.PaWorkFlowRecordsDto;
import com.ait.pa.workManagement.mapper.PaWorkFlowMapper;
import com.ait.pa.workManagement.service.PaWorkFlowService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaWorkFlowServiceImpl implements PaWorkFlowService {

    private static final Logger log = LoggerFactory.getLogger(PaWorkFlowServiceImpl.class);

    @Autowired
    private PaWorkFlowMapper mapper;

    @Override
    public PaWorkFlowDto getWorkFlow(String payScheduleNo) {
        try {
            return mapper.selectOne(payScheduleNo);
        } catch (Exception e) {
            log.error("Lỗi khi lấy quy trình tính lương payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<PaWorkFlowRecordsDto> getRecordList(String payScheduleNo, Integer flowStep) {
        try {
            log.info("Lấy lịch sử thao tác payScheduleNo={}, flowStep={}", payScheduleNo, flowStep);
            return mapper.selectRecordList(payScheduleNo, flowStep);
        } catch (Exception e) {
            log.error("Lỗi khi lấy lịch sử thao tác payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public String modifyWorkFlow(String payScheduleNo, String type) {
        try {
            log.info("Bắt đầu xử lý quy trình lương payScheduleNo={}, type={}", payScheduleNo, type);
            PaWorkFlowDto dto = new PaWorkFlowDto();
            dto.setPayScheduleNo(payScheduleNo);
            dto.setType(type);
            mapper.callModifyWorkFlow(dto);
            String msg = dto.getMessage();
            log.info("Kết quả xử lý quy trình lương payScheduleNo={}, type={}: {}", payScheduleNo, type, msg);
            return msg;
        } catch (Exception e) {
            log.error("Lỗi khi xử lý quy trình lương payScheduleNo={}, type={}: {}", payScheduleNo, type, e.getMessage(), e);
            throw e;
        }
    }
}
