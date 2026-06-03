package com.ait.pa.workManagement.service.impl;

import com.ait.pa.workManagement.dto.PaPayScheduleDto;
import com.ait.pa.workManagement.mapper.PaPayScheduleMapper;
import com.ait.pa.workManagement.dto.PaWorkFlowDto;
import com.ait.pa.workManagement.mapper.PaWorkFlowMapper;
import com.ait.pa.workManagement.service.PaPayScheduleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaPayScheduleServiceImpl implements PaPayScheduleService {

    private static final Logger log = LoggerFactory.getLogger(PaPayScheduleServiceImpl.class);

    @Autowired
    private PaPayScheduleMapper mapper;
    @Autowired
    private PaWorkFlowMapper workFlowMapper;

    @Override
    public List<PaPayScheduleDto> getList(PaPayScheduleDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách kế hoạch trả lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<PaPayScheduleDto> getOpenList() {
        try {
            return mapper.selectOpenList();
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách kế hoạch trả lương đã mở: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public PaPayScheduleDto getOne(String payScheduleNo) {
        try {
            return mapper.selectOne(payScheduleNo);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết kế hoạch trả lương {}: {}", payScheduleNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void save(PaPayScheduleDto dto) {
        try {
            if (dto.getPayScheduleNo() == null || dto.getPayScheduleNo().isEmpty()) {
                String seq = mapper.getNextSeq();
                dto.setPayScheduleNo(seq);
                mapper.insert(dto);
                // Đồng thời tạo mới quy trình tính lương tương ứng
                PaWorkFlowDto workFlowDto = new PaWorkFlowDto();
                workFlowDto.setPayScheduleNo(seq);
                workFlowMapper.insert(workFlowDto);
                log.info("Thêm mới kế hoạch trả lương: payScheduleNo={}", seq);
            } else {
                mapper.update(dto);
                log.info("Cập nhật kế hoạch trả lương: payScheduleNo={}", dto.getPayScheduleNo());
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu kế hoạch trả lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void delete(String payScheduleNo) {
        try {
            mapper.delete(payScheduleNo);
            log.info("Xóa kế hoạch trả lương: payScheduleNo={}", payScheduleNo);
        } catch (Exception e) {
            log.error("Lỗi khi xóa kế hoạch trả lương {}: {}", payScheduleNo, e.getMessage(), e);
            throw e;
        }
    }
}
