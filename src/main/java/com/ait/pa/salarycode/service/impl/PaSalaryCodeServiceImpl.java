package com.ait.pa.salarycode.service.impl;

import com.ait.pa.salarycode.dto.PaSalaryCodeDto;
import com.ait.pa.salarycode.mapper.PaSalaryCodeMapper;
import com.ait.pa.salarycode.service.PaSalaryCodeService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaSalaryCodeServiceImpl implements PaSalaryCodeService {

    private static final Logger log = LoggerFactory.getLogger(PaSalaryCodeServiceImpl.class);

    @Autowired
    private PaSalaryCodeMapper mapper;

    @Override
    public DataTablesResponse<PaSalaryCodeDto> getPagedList(PaSalaryCodeDto params) {
        try {
            long total = mapper.countList(params);
            List<PaSalaryCodeDto> data = mapper.selectListPage(params);
            log.info("Phân trang hạng mục lương: total={}, start={}, length={}", total, params.getStart(), params.getLength());
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi phân trang hạng mục lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public PaSalaryCodeDto getOne(Integer itemType, String itemNo) {
        try {
            PaSalaryCodeDto dto;
            if (itemType != null && itemType == 6) {
                dto = mapper.selectOneItem(itemNo);
                if (dto != null) {
                    dto.setCompanyUsage(mapper.selectItemCompanies(itemNo));
                }
            } else {
                dto = mapper.selectOneParamItem(itemNo);
                if (dto != null) {
                    dto.setCompanyUsage(mapper.selectParamItemCompanies(itemNo));
                }
            }
            return dto;
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết hạng mục lương itemNo={}: {}", itemNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void save(PaSalaryCodeDto dto) {
        try {
            boolean isNew = (dto.getItemNo() == null || dto.getItemNo().isEmpty());
            if (isNew) {
                // ITEM_NO / PARAM_ITEM_NO dùng chung SY_GLOBAL_NO_SEQ
                String newNo = mapper.getNextNo();
                dto.setItemNo(newNo);
            }
            if (dto.getItemType() != null && dto.getItemType() == 6) {
                if (isNew) {
                    mapper.insertItem(dto);
                    log.info("Thêm mới PA_ITEM: itemNo={}, itemId={}", dto.getItemNo(), dto.getItemId());
                } else {
                    mapper.updateItem(dto);
                    log.info("Cập nhật PA_ITEM: itemNo={}", dto.getItemNo());
                }
            } else {
                if (isNew) {
                    mapper.insertParamItem(dto);
                    log.info("Thêm mới PA_PARAM_ITEM: itemNo={}, itemId={}, itemType={}", dto.getItemNo(), dto.getItemId(), dto.getItemType());
                } else {
                    mapper.updateParamItem(dto);
                    log.info("Cập nhật PA_PARAM_ITEM: itemNo={}", dto.getItemNo());
                }
            }
            // Đồng bộ công ty sử dụng vào PARAM table tương ứng
            if (dto.getItemType() != null && dto.getItemType() == 6) {
                mapper.deactivateItemParams(dto.getItemNo());
                if (dto.getCompanyUsage() != null) {
                    for (String cpny : dto.getCompanyUsage()) {
                        if (cpny != null && !cpny.trim().isEmpty()) {
                            mapper.insertItemParam(dto.getItemNo(), cpny.trim());
                            log.info("Thêm PA_ITEM_PARAM: itemNo={}, cpny={}", dto.getItemNo(), cpny.trim());
                        }
                    }
                }
            } else {
                mapper.deactivateParamItemParams(dto.getItemNo());
                if (dto.getCompanyUsage() != null) {
                    for (String cpny : dto.getCompanyUsage()) {
                        if (cpny != null && !cpny.trim().isEmpty()) {
                            mapper.insertParamItemParam(dto.getItemNo(), cpny.trim());
                            log.info("Thêm PA_PARAM_ITEM_PARAM: itemNo={}, cpny={}", dto.getItemNo(), cpny.trim());
                        }
                    }
                }
            }

            // Lưu 4 ngôn ngữ vào SY_GLOBAL_NAME
            Map<String, String> langNames = new LinkedHashMap<>();
            langNames.put("en", dto.getNameEn());
            langNames.put("ko", dto.getNameKo());
            langNames.put("vi", dto.getNameVi());
            langNames.put("zh", dto.getNameZh());
            for (Map.Entry<String, String> entry : langNames.entrySet()) {
                if (entry.getValue() != null && !entry.getValue().trim().isEmpty()) {
                    mapper.mergeGlobalNameRow(dto.getItemNo(), entry.getKey(), entry.getValue().trim());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu hạng mục lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteList(List<PaSalaryCodeDto> keys) {
        try {
            for (PaSalaryCodeDto key : keys) {
                if (key.getItemType() != null && key.getItemType() == 6) {
                    mapper.deleteItem(key.getItemNo());
                    log.info("Xóa PA_ITEM: itemNo={}", key.getItemNo());
                } else {
                    mapper.deleteParamItem(key.getItemNo());
                    log.info("Xóa PA_PARAM_ITEM: itemNo={}", key.getItemNo());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa danh sách hạng mục lương: {}", e.getMessage(), e);
            throw e;
        }
    }
}
