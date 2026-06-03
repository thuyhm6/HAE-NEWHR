package com.ait.pa.salary.service.impl;

import com.ait.pa.salary.dto.PaInputItemParamDto;
import com.ait.pa.salary.mapper.PaInputItemParamMapper;
import com.ait.pa.salary.service.PaInputItemParamService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaInputItemParamServiceImpl implements PaInputItemParamService {

    private static final Logger log = LoggerFactory.getLogger(PaInputItemParamServiceImpl.class);

    @Autowired
    private PaInputItemParamMapper mapper;

    @Override
    public DataTablesResponse<PaInputItemParamDto> getPagedList(PaInputItemParamDto params) {
        try {
            long total = mapper.countList(params);
            List<PaInputItemParamDto> data = mapper.selectListPage(params);
            log.info("Phân trang thông số mục nhập: total={}, start={}, length={}", total, params.getStart(), params.getLength());
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi phân trang thông số mục nhập: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public PaInputItemParamDto getOne(String paramNo) {
        try {
            PaInputItemParamDto dto = mapper.selectOne(paramNo);
            log.info("Lấy thông số mục nhập paramNo={}", paramNo);
            return dto;
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông số mục nhập paramNo={}: {}", paramNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void update(PaInputItemParamDto dto) {
        try {
            mapper.updateOne(dto);
            log.info("Cập nhật thông số mục nhập paramNo={}", dto.getParamNo());
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật thông số mục nhập paramNo={}: {}", dto.getParamNo(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<PaInputItemParamDto> getDistinctList() {
        try {
            List<PaInputItemParamDto> list = mapper.selectDistinctList(new PaInputItemParamDto());
            log.info("Lấy danh sách PA_DISTINCT_LIST: count={}", list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách PA_DISTINCT_LIST: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteList(List<String> paramNos) {
        try {
            for (String paramNo : paramNos) {
                mapper.deleteOne(paramNo);
                log.info("Xóa thông số mục nhập paramNo={}", paramNo);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa thông số mục nhập: {}", e.getMessage(), e);
            throw e;
        }
    }
}
