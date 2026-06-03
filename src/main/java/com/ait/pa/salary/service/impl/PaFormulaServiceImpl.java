package com.ait.pa.salary.service.impl;

import com.ait.pa.salary.dto.PaFormulaDto;
import com.ait.pa.salary.dto.PaFormulaToolItemDto;
import com.ait.pa.salary.mapper.PaFormulaMapper;
import com.ait.pa.salary.service.PaFormulaService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaFormulaServiceImpl implements PaFormulaService {

    private static final Logger log = LoggerFactory.getLogger(PaFormulaServiceImpl.class);

    @Autowired
    private PaFormulaMapper mapper;

    @Override
    public List<PaFormulaDto> getItemList() {
        try {
            List<PaFormulaDto> list = mapper.selectItemList(new PaFormulaDto());
            log.info("Lấy danh sách hạng mục tính: count={}", list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục tính: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Map<String, List<PaFormulaToolItemDto>> getToolItems() {
        try {
            Map<String, List<PaFormulaToolItemDto>> result = new HashMap<>();
            result.put("paramItems",      mapper.selectToolParamItemList());
            result.put("salaryItems",     mapper.selectToolSalaryItemList());
            result.put("attendanceItems", mapper.selectToolAttendanceItemList());
            result.put("fixedParams",     mapper.selectToolFixedParamList());
            log.info("Lấy danh sách công cụ công thức thành công");
            return result;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách công cụ công thức: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<PaFormulaToolItemDto> getAllItemNames() {
        try {
            List<PaFormulaToolItemDto> list = mapper.selectAllItemNames();
            log.info("Lấy toàn bộ ITEM_ID→ITEM_NAME: count={}", list.size());
            return list;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách ITEM_NAME: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public DataTablesResponse<PaFormulaDto> getPagedFormularList(PaFormulaDto params) {
        try {
            long total = mapper.countFormularList(params);
            List<PaFormulaDto> data = mapper.selectFormularListPage(params);
            log.info("Phân trang công thức: itemNo={}, total={}", params.getItemNo(), total);
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi phân trang công thức: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public PaFormulaDto getOneFormular(Long formularNo) {
        try {
            PaFormulaDto dto = mapper.selectFormularOne(formularNo);
            log.info("Lấy công thức formularNo={}", formularNo);
            return dto;
        } catch (Exception e) {
            log.error("Lỗi khi lấy công thức formularNo={}: {}", formularNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void insertFormular(PaFormulaDto dto) {
        try {
            mapper.insertFormular(dto);
            log.info("Thêm mới công thức itemNo={}", dto.getItemNo());
        } catch (Exception e) {
            log.error("Lỗi khi thêm mới công thức itemNo={}: {}", dto.getItemNo(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void updateFormular(PaFormulaDto dto) {
        try {
            mapper.updateFormular(dto);
            log.info("Cập nhật công thức formularNo={}", dto.getFormularNo());
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật công thức formularNo={}: {}", dto.getFormularNo(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteFormular(Long formularNo) {
        try {
            mapper.deleteFormular(formularNo);
            log.info("Xóa công thức formularNo={}", formularNo);
        } catch (Exception e) {
            log.error("Lỗi khi xóa công thức formularNo={}: {}", formularNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void swapConditionSeq(Long formularNo, String itemNo, String direction) {
        try {
            PaFormulaDto current = mapper.selectFormularOne(formularNo);
            if (current == null) {
                throw new RuntimeException("Không tìm thấy công thức formularNo=" + formularNo);
            }
            PaFormulaDto adjacent = mapper.findAdjacentBySeq(itemNo, current.getConditionSeq(), direction);
            if (adjacent != null) {
                // Dùng giá trị âm làm trung gian để tránh vi phạm unique constraint UK_PA_FORMULAR
                // (ITEM_NO, CPNY_ID, CONDITION_SEQ). CONDITION_SEQ thực luôn >= 1 nên giá trị âm an toàn.
                int tempSeq = -(current.getConditionSeq() + adjacent.getConditionSeq());
                mapper.updateConditionSeq(formularNo, tempSeq);
                mapper.updateConditionSeq(adjacent.getFormularNo(), current.getConditionSeq());
                mapper.updateConditionSeq(formularNo, adjacent.getConditionSeq());
                log.info("Hoán đổi CONDITION_SEQ: {} ({}) <-> {} ({})",
                        formularNo, adjacent.getConditionSeq(),
                        adjacent.getFormularNo(), current.getConditionSeq());
            }
        } catch (Exception e) {
            log.error("Lỗi khi hoán đổi trình tự tính formularNo={}: {}", formularNo, e.getMessage(), e);
            throw e;
        }
    }
}
