package com.ait.pa.salary.service.impl;

import com.ait.pa.salary.dto.PaComputeItemParamDto;
import com.ait.pa.salary.mapper.PaComputeItemParamMapper;
import com.ait.pa.salary.service.PaComputeItemParamService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaComputeItemParamServiceImpl implements PaComputeItemParamService {

    private static final Logger log = LoggerFactory.getLogger(PaComputeItemParamServiceImpl.class);

    @Autowired
    private PaComputeItemParamMapper mapper;

    @Override
    public DataTablesResponse<PaComputeItemParamDto> getPagedList(PaComputeItemParamDto params) {
        try {
            long total = mapper.countList(params);
            List<PaComputeItemParamDto> data = mapper.selectListPage(params);
            log.info("Phân trang thông số mục tính toán: total={}, start={}, length={}", total, params.getStart(), params.getLength());
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi phân trang thông số mục tính toán: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public PaComputeItemParamDto getOne(String paramNo) {
        try {
            PaComputeItemParamDto dto = mapper.selectOne(paramNo);
            log.info("Lấy thông số mục tính toán paramNo={}", paramNo);
            return dto;
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông số mục tính toán paramNo={}: {}", paramNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void insert(PaComputeItemParamDto dto) {
        try {
            mapper.insertOne(dto);
            log.info("Thêm mới thông số mục tính toán itemNo={}, cpnyId={}", dto.getItemNo(), dto.getCpnyId());
        } catch (Exception e) {
            log.error("Lỗi khi thêm mới thông số mục tính toán: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void update(PaComputeItemParamDto dto) {
        try {
            mapper.updateOne(dto);
            log.info("Cập nhật thông số mục tính toán paramNo={}", dto.getParamNo());
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật thông số mục tính toán paramNo={}: {}", dto.getParamNo(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteList(List<String> paramNos) {
        try {
            for (String paramNo : paramNos) {
                mapper.deleteOne(paramNo);
                log.info("Xóa thông số mục tính toán paramNo={}", paramNo);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa thông số mục tính toán: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<PaComputeItemParamDto> getItemList() {
        try {
            List<PaComputeItemParamDto> list = mapper.selectItemList(new PaComputeItemParamDto());
            log.info("Lấy danh sách PA_ITEM cho dropdown: count={}", list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách PA_ITEM: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<PaComputeItemParamDto> getApplyTypeList() {
        try {
            List<PaComputeItemParamDto> list = mapper.selectApplyTypeList(new PaComputeItemParamDto());
            log.info("Lấy danh sách APPLY_TYPE: count={}", list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách APPLY_TYPE: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void swapOrder(String paramNo, String direction) {
        try {
            PaComputeItemParamDto current = mapper.selectOne(paramNo);
            if (current == null) {
                throw new RuntimeException("Không tìm thấy bản ghi paramNo=" + paramNo);
            }
            PaComputeItemParamDto adjacent = mapper.findAdjacentByOrder(current.getCalcuOrder(), direction);
            if (adjacent != null) {
                mapper.updateCalcuOrder(paramNo, adjacent.getCalcuOrder());
                mapper.updateCalcuOrder(adjacent.getParamNo(), current.getCalcuOrder());
                log.info("Hoán đổi CALCU_ORDER: {} ({}) <-> {} ({})",
                        paramNo, adjacent.getCalcuOrder(), adjacent.getParamNo(), current.getCalcuOrder());
            }
        } catch (Exception e) {
            log.error("Lỗi khi hoán đổi thứ tự tính paramNo={}: {}", paramNo, e.getMessage(), e);
            throw e;
        }
    }
}
