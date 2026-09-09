package com.ait.sy.feedback.service.impl;

import com.ait.sy.feedback.dto.SyFeedbackDto;
import com.ait.sy.feedback.mapper.SyFeedbackMapper;
import com.ait.sy.feedback.service.SyFeedbackService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SyFeedbackServiceImpl implements SyFeedbackService {

    private static final Logger log = LoggerFactory.getLogger(SyFeedbackServiceImpl.class);

    @Autowired
    private SyFeedbackMapper mapper;

    @Override
    public DataTablesResponse<SyFeedbackDto> getPagedList(SyFeedbackDto params) {
        try {
            long total = mapper.countList(params);
            List<SyFeedbackDto> data = mapper.selectListPage(params);
            log.info("Phân trang SY_FEEDBACK: total={}, start={}, length={}", total, params.getStart(), params.getLength());
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách góp ý: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void submitFeedback(SyFeedbackDto dto) {
        try {
            mapper.insert(dto);
            log.info("Đã lưu góp ý mới từ trang đăng nhập: title={}", dto.getFeedbackTitle());
        } catch (Exception e) {
            log.error("Lỗi khi lưu góp ý: {}", e.getMessage(), e);
            throw e;
        }
    }
}
